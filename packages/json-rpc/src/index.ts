import {
  DecoratorContext,
  EmitContext,
  Interface,
  Model,
  mutateSubgraph,
  Mutator,
  MutatorFlow,
  Mutators,
  Operation,
  Program,
  state,
  StateContext,
  Type,
} from "@typespec/compiler";
import {
  AssetEmitter,
  CodeTypeEmitter,
  Context,
  SourceFile,
} from "@typespec/compiler/emitter-framework";
import { JsonSchemaEmitter } from "@typespec/json-schema";
import { TypeScriptInterfaceEmitter } from "../vendor/ts-interface-emitter/typescript-emitter.js";
import { createStateSymbol } from "./lib.js";
export * from "./expressAdapter.js";

export async function $onEmit(context: EmitContext) {
  const emitter = context.getAssetEmitter(JsonApiTypeScriptEmitter);
  emitter.emitProgram();
  await emitter.writeOutput();
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

  operationParametersReferenceContext(operation: Operation, parameters: Model): Context {
    const appliedVis = getOperationVisibility(this.#program, operation);
    if (!appliedVis) {
      return {};
    }

    if (appliedVis === "update") {
      this.emitter.enableMutator([Mutators.Visibility.update, Mutators.JSONMergePatch]);
    } else {
      this.emitter.enableMutator(Mutators.Visibility[appliedVis]);
    }
    return {};
  }

  operationReturnTypeReferenceContext(operation: Operation, returnType: Type): Context {
    this.emitter.enableMutator(Mutators.Visibility.read);
    return {};
  }
}

class JsonApiTypeScriptEmitter extends CodeTypeEmitter {
  #jsonSchemaEmitter!: AssetEmitter<object>;
  #typescriptEmitter!: AssetEmitter<string>;

  #program: Program;

  constructor(emitter: AssetEmitter<string, any>) {
    super(emitter);
    this.#program = emitter.getProgram();

    this.#jsonSchemaEmitter = this.emitter
      .getEmitContext()
      .getAssetEmitter(JsonSchemaEmitter as any);
    this.#typescriptEmitter = this.emitter.getEmitContext().getAssetEmitter(TSRPCInterfaceEmitter);
  }

  program(program: Program) {
    // todo: fix this cast
    const jsonRpcs = getJsonRpcs({ program }) as IterableIterator<Interface>;
    for (const rpc of jsonRpcs) {
      this.#typescriptEmitter.emitType(rpc);
      for (const op of rpc.operations.values()) {
        for (const prop of op.parameters.properties.values()) {
          if (prop.type.kind === "ModelProperty") {
            // model property references don't apply visibility;
            this.#jsonSchemaEmitter.emitType(prop.type);
            continue;
          }
          const cloneProp = mutateSubgraph(
            program,
            [declarationMutator(op.name + prop.name + "Parameter")],
            prop.type as any
          );
          this.#jsonSchemaEmitter.emitType(cloneProp.type);
        }
        if (op.returnType.kind === "Model") {
          const clonedReturnType = mutateSubgraph(
            program,
            [declarationMutator(op.name + "ReturnType")],
            op.returnType
          );
          this.#jsonSchemaEmitter.emitType(clonedReturnType.type);
        }
      }
    }
  }

  async writeOutput(sourceFiles: SourceFile<string>[]): Promise<void> {
    await this.#jsonSchemaEmitter.writeOutput();
    await this.#typescriptEmitter.writeOutput();
    await super.writeOutput(sourceFiles);
  }
}

export const namespace = "JsonRpc";

const queryKey = createStateSymbol("JsonRpc.query");
const createKey = createStateSymbol("JsonRpc.create");
const updateKey = createStateSymbol("JsonRpc.update");
const deleteKey = createStateSymbol("JsonRpc.delete");
const jsonRpcKey = createStateSymbol("JsonRpc");
export const { dec: $query, get: getQuery } = createDecorator(queryKey);
export const { dec: $create, get: getCreate } = createDecorator(createKey);
export const { dec: $update, get: getUpdate } = createDecorator(updateKey);
export const { dec: $delete, get: getDelete } = createDecorator(deleteKey);
export const { dec: $jsonRpc, list: getJsonRpcs } = createDecorator(jsonRpcKey);

function createDecorator(key: symbol) {
  function dec(context: DecoratorContext, target: Type) {
    state(context, key).set(target, true);
  }

  function get(context: StateContext, target: Type) {
    return state(context, key).get(target);
  }

  function list(context: StateContext) {
    return state(context, key).keys();
  }

  return { dec, get, list };
}

export function getOperationVisibility(program: Program, op: Operation) {
  const context = {
    program: program,
  };

  if (getQuery(context, op)) {
    return "query";
  }
  if (getCreate(context, op)) {
    return "create";
  }
  if (getUpdate(context, op)) {
    return "update";
  }
  if (getDelete(context, op)) {
    return "delete";
  }
  return null;
}

function declarationMutator(name: string): Mutator {
  return {
    name: "JsonRpc.declarationMutator",
    Model: {
      filter(m) {
        if (m.name) {
          return MutatorFlow.DontRecurse;
        } else {
          return MutatorFlow.DontRecurse | MutatorFlow.DontMutate;
        }
      },
      mutate(m, clone) {
        if (!name) {
          return;
        }

        clone.name = name;
      },
    },
  };
}
