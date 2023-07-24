import {
  $format,
  EmitContext,
  emitFile,
  getRelativePathFromDirectory,
  Interface,
  isArrayModelType,
  joinPaths,
  Model,
  mutateSubgraph,
  Mutator,
  MutatorFlow,
  Mutators,
  Operation,
  Program,
  Scalar,
  setState,
  state,
  StateContext,
  stateMap,
  Type,
} from "@typespec/compiler";
import {
  AssetEmitter,
  code,
  Context,
  Declaration,
  EmitterOutput,
  SourceFile,
  TypeSpecDeclaration,
} from "@typespec/compiler/emitter-framework";
import { JsonSchemaEmitter } from "@typespec/json-schema";
import prettier from "prettier";
import { TypeScriptInterfaceEmitter } from "../vendor/ts-interface-emitter/typescript-emitter.js";
import { createStateSymbol } from "./lib.js";
export * from "./expressAdapter.js";

interface RPCOperationParameter {
  name: string;
  type: Type;
  optional: boolean;
}
interface RPCOperation {
  op: Operation;
  parameters: RPCOperationParameter[];
  returnType: Type;
}

export async function $onEmit(context: EmitContext) {
  const jsonSchemaEmitter = context.getAssetEmitter(JsonSchemaEmitter as any, {
    emitAllRefs: true,
  });
  const jsonSchemaJsonEmitter = context.getAssetEmitter(RPCSchemaEmitter as any, {
    emitAllRefs: true,
    "file-type": "json",
  });
  const typescriptEmitter = context.getAssetEmitter(TSRPCInterfaceEmitter);
  typescriptEmitter.emitProgram();
  const program = context.program;

  const jsonRpcs = getJsonRpcs({ program }) as IterableIterator<Interface>;
  for (const rpc of jsonRpcs) {
    // todo: probably have some kind of decl getter so we don't need to re-emit (even though it bails early)
    const decl = typescriptEmitter.emitType(rpc) as Declaration<string>;

    const rpcSpec: RPCOperation[] = [];

    for (const op of rpc.operations.values()) {
      const opSpec: RPCOperation = {
        op,
        parameters: [],
        returnType: undefined as any,
      };

      const mutators = mutatorsForVisibility(program, op);
      for (const prop of op.parameters.properties.values()) {
        if (prop.type.kind === "ModelProperty") {
          // todo: use a realm, use mutators maybe
          const clone = program.typeFactory.initializeClone(prop.type.type) as Model | Scalar;
          if (clone.kind === "Scalar") {
            console.log("Setting base scalar");
            clone.baseScalar = prop.type.type as Scalar;
            clone.namespace = undefined; // don't trip up std type check
          }
          clone.decorators.push(...prop.type.decorators);
          clone.name = op.name + prop.name + "Parameter";
          program.typeFactory.finishType(clone);
          jsonSchemaJsonEmitter.emitType(clone);
          jsonSchemaEmitter.emitType(clone);
          opSpec.parameters.push({
            name: prop.name,
            type: clone,
            optional: prop.optional,
          });
          continue;
        }
        const cloneProp = mutateSubgraph(
          program,
          [...mutators, declarationMutator(op.name + prop.name + "Parameter")],
          prop.type as any
        );
        opSpec.parameters.push({
          name: prop.name,
          type: cloneProp.type,
          optional: prop.optional,
        });
        jsonSchemaJsonEmitter.emitType(cloneProp.type);
        jsonSchemaEmitter.emitType(cloneProp.type);
      }

      if (op.returnType.kind === "Model") {
        const clonedReturnType = mutateSubgraph(
          program,
          [Mutators.Visibility.read, declarationMutator(op.name + "ReturnType")],
          op.returnType
        );
        opSpec.returnType = clonedReturnType.type;
        jsonSchemaJsonEmitter.emitType(clonedReturnType.type);
        jsonSchemaEmitter.emitType(clonedReturnType.type);
      }

      rpcSpec.push(opSpec);
    }

    await writeMarshaller(context, decl.name, rpcSpec);
  }

  await jsonSchemaEmitter.writeOutput();
  await typescriptEmitter.writeOutput();
  await jsonSchemaJsonEmitter.writeOutput();
}

async function writeMarshaller(context: EmitContext, name: string, rpcs: RPCOperation[]) {
  let code = `
    import * as validators from "./validators.js";
    import { ${name} } from "./interfaces.js";
    export function create${name}Marshaller(iface: ${name}) {
      return {
        name: "${name}",
        methods: {
  `;

  for (const opSpec of rpcs) {
    code += `async ${opSpec.op.name}(params: Record<string, unknown>) {
      ${opMarshalling(opSpec)}
    },`;
  }

  code += `
        }
      }
    }`;

  await emitFile(context.program, {
    path: joinPaths(context.emitterOutputDir, "marshaller.ts"),
    content: prettier.format(code, {
      parser: "typescript",
    }),
  });
}

function opMarshalling(op: RPCOperation): string {
  let code = "";
  for (const param of op.parameters) {
    if (!param.optional) {
      code += `
        if (!Object.hasOwn(params, "${param.name}")) {
          throw new Error("Missing required parameter ${param.name}");
        }
      `;
    }

    code += `
      const ${param.name} = params["${param.name}"];
    `;

    code += `if(${param.name} && !validators.validate${(param.type as any).name}(${param.name})) {
      throw new Error(validators.validate${(param.type as any).name}.errors![0].message);
    }`;
  }
  // dispatch!
  code += `const returnType = await iface.${op.op.name}(${[...op.parameters.entries()]
    .map(([i, p]) => `${p.name} as Parameters<typeof iface.${op.op.name}>[${i}]`)
    .join(", ")});
    
    const wireType = { ... returnType };
    `;

  for (const prop of (op.returnType as Model).properties.values()) {
    if (prop.type.kind === "Scalar" && prop.type.name === "utcDateTime") {
      code += `wireType.${prop.name} = wireType.${prop.name}.toISOString() as any;`;
    }
  }
  code += `if (!validators.validate${(op.returnType as any).name}(wireType)) {
      throw new Error("Error validating return type for ${op.op.name}: " + validators.validate${
    (op.returnType as any).name
  }.errors![0].message);
    }

    return wireType;`;

  return code;
}
class RPCSchemaEmitter extends JsonSchemaEmitter {
  declarationName(declarationType: TypeSpecDeclaration): string | undefined {
    if (
      declarationType.kind === "Model" &&
      isArrayModelType(this.emitter.getProgram(), declarationType) &&
      declarationType.name !== "Array"
    ) {
      return declarationType.name;
    }

    return super.declarationName(declarationType);
  }

  async writeOutput(sourceFiles: SourceFile<Record<string, any>>[]) {
    let schemasTsContents = ``;

    let validateTsContents = `
    import Ajv2020 from "ajv/dist/2020.js";
    import addFormats from "ajv-formats";
    import * as schemas from "./schemas.js";
    const ajv = new Ajv2020.default();
    addFormats.default(ajv);
    ajv.addSchema([... Object.values(schemas)]);

    `;

    for (const sf of sourceFiles) {
      const emittedSf = this.emitter.emitSourceFile(sf);
      const name = getRelativePathFromDirectory(
        this.emitter.getOptions().emitterOutputDir,
        emittedSf.path,
        false
      );
      const key = name.replace(/\.[^/.]+$/, "");

      schemasTsContents += `export const ${key} = ${emittedSf.contents};`;
      validateTsContents += `export const validate${key} = ajv.getSchema("${name}")!;`;
    }

    emitFile(this.emitter.getProgram(), {
      path: joinPaths(this.emitter.getOptions().emitterOutputDir, "schemas.ts"),
      content: prettier.format(schemasTsContents, {
        parser: "typescript",
      }),
    });
    emitFile(this.emitter.getProgram(), {
      path: joinPaths(this.emitter.getOptions().emitterOutputDir, "validators.ts"),
      content: prettier.format(validateTsContents, {
        parser: "typescript",
      }),
    });
  }
}

class TSRPCInterfaceEmitter extends TypeScriptInterfaceEmitter {
  #program: Program;
  #interfaceSf: SourceFile<string>;
  #typesSf: SourceFile<string>;

  constructor(emitter: AssetEmitter<string, any>) {
    super(emitter);
    this.#program = emitter.getProgram();

    this.#interfaceSf = this.emitter.createSourceFile("interfaces.ts");
    this.#typesSf = this.emitter.createSourceFile("types.ts");
  }

  modelDeclarationContext(model: Model, name: string): Context {
    return {
      scope: this.#typesSf.globalScope,
    };
  }

  operationDeclarationContext(operation: Operation): Context {
    return {
      scope: this.#interfaceSf.globalScope,
    };
  }

  interfaceOperationDeclarationContext(operation: Operation): Context {
    return {
      scope: this.#interfaceSf.globalScope,
    };
  }

  interfaceDeclarationContext(iface: Interface): Context {
    return {
      scope: this.#interfaceSf.globalScope,
    };
  }

  operationParameters(operation: Operation, parameters: Model): EmitterOutput<string> {
    const mutators = mutatorsForVisibility(this.#program, operation);
    if (mutators.length === 0) {
      return super.operationParameters(operation, parameters);
    }

    const clone = mutateSubgraph(this.#program, mutators, parameters);
    return super.operationParameters(operation, clone.type as Model);
  }

  operationReturnType(operation: Operation, returnType: Type): EmitterOutput<string> {
    const clone = mutateSubgraph(this.#program, [Mutators.Visibility.read], returnType as any);
    return super.operationReturnType(operation, clone.type);
  }

  interfaceOperationDeclaration(operation: Operation, name: string): EmitterOutput<string> {
    return code`${name}${this.#operationSignature(operation)}`;
  }

  #operationSignature(operation: Operation) {
    return code`(${this.emitter.emitOperationParameters(
      operation
    )}): Promise<${this.emitter.emitOperationReturnType(operation)}>`;
  }
}

export const namespace = "JsonRpc";

export const { dec: $query, get: getQuery } = createDecorator("JsonRpc.query");
export const { dec: $create, get: getCreate } = createDecorator("JsonRpc.create");
export const { dec: $update, get: getUpdate } = createDecorator("JsonRpc.update");
export const { dec: $delete, get: getDelete } = createDecorator("JsonRpc.delete");
export const { dec: $jsonRpc, list: getJsonRpcs } = createDecorator("JsonRpc.list");

function createDecorator(name: string) {
  const key = createStateSymbol(name);

  function dec(context: DecoratorContext, target: Type) {
    setState(key, target, true);
  }

  function get(target: Type): boolean {
    return state(key, target);
  }

  function list(context: StateContext) {
    return stateMap(context, key).keys();
  }

  return { dec, get, list };
}

export function getOperationVisibility(program: Program, op: Operation) {
  if (getQuery(op)) {
    return "query";
  }
  if (getCreate(op)) {
    return "create";
  }
  if (getUpdate(op)) {
    return "update";
  }
  if (getDelete(op)) {
    return "delete";
  }
  return null;
}

function mutatorsForVisibility(program: Program, operation: Operation) {
  const appliedVis = getOperationVisibility(program, operation);
  if (!appliedVis) {
    return [];
  }

  if (appliedVis === "update") {
    return [Mutators.Visibility.update, Mutators.JSONMergePatch];
  } else {
    return [Mutators.Visibility[appliedVis]];
  }
}

function declarationMutator(name: string): Mutator {
  return {
    name: "JsonRpc.declarationMutator",
    Model: {
      filter(m, program) {
        if (m.name && !(isArrayModelType(program, m) && m.name === "Array")) {
          return MutatorFlow.DontRecurse | MutatorFlow.DontMutate;
        } else {
          return MutatorFlow.DontRecurse;
        }
      },
      mutate(m, clone) {
        clone.name = name;
      },
    },
    Scalar: {
      filter(m) {
        return MutatorFlow.DontRecurse;
      },
      mutate(s, clone) {
        clone.baseScalar = s;
        clone.name = name;
        clone.namespace = undefined; // this is a fun one, not setting this trips up std type check
      },
    },
  };
}

const JSONMutator: Mutator = {
  name: "JsonRpc.JSONMutator",
  Scalar: {
    filter(s, program) {
      return s.name === "utcDateTime" || s.name === "offsetDateTime";
    },
    replace(s, clone, program, realm) {
      if (s.name === "utcDateTime" || s.name === "offsetDateTime") {
        return realm.typeFactory.scalar([$format, "date"], realm.typeFactory.string, {
          extends: realm.typeFactory.string,
        });
      }

      return s;
    },
  },
};

/*

*/
