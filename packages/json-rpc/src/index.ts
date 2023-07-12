import {
  DecoratorContext,
  EmitContext,
  Interface,
  Model,
  Operation,
  Program,
  Realm,
  state,
  StateContext,
  Type,
  VisibilityRealm,
} from "@typespec/compiler";
import {
  AssetEmitter,
  CodeTypeEmitter,
  Context,
  SourceFile,
} from "@typespec/compiler/emitter-framework";
import { JsonSchemaEmitter } from "@typespec/json-schema";
import { TypeScriptInterfaceEmitter } from "../vendor/ts-interface-emitter/typescript-emitter.js";
import { ExprToDeclRealm } from "./expr-to-decl-realm.js";
import { JsonMergePatchRealm } from "./json-patch-realm.js";
import { createStateSymbol } from "./lib.js";
export * from "./expressAdapter.js";

export async function $onEmit(context: EmitContext) {
  const emitter = context.getAssetEmitter(JsonApiTypeScriptEmitter);
  emitter.emitProgram();
  await emitter.writeOutput();
}

interface VisibilityRealms {
  read: Realm;
  query: Realm;
  create: Realm;
  update: Realm;
  delete: Realm;
}

class TSRPCInterfaceEmitter extends TypeScriptInterfaceEmitter {
  #program: Program;

  #realms: VisibilityRealms;

  #interfaceSf: SourceFile<string>;
  #typesSf: SourceFile<string>;

  constructor(emitter: AssetEmitter<string>, options: { realms: VisibilityRealms }) {
    super(emitter);
    console.log("Got options", options);
    this.#program = emitter.getProgram();
    this.#realms = options.realms;

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

    const realm = this.#realms[appliedVis];
    realm.clone(parameters);

    console.log("Setting context for op params");
    return { realmKey: realm.key };
  }

  operationReturnTypeReferenceContext(operation: Operation, returnType: Type): Context {
    const realm = this.#realms.read;
    realm.clone(returnType as any); // fix cast
    return {
      realmKey: this.#realms["read"].key,
    };
  }
}

class JsonApiTypeScriptEmitter extends CodeTypeEmitter {
  #jsonSchemaEmitter!: AssetEmitter<object>;
  #typescriptEmitter!: AssetEmitter<string>;

  #realms: {
    read: VisibilityRealm;
    query: VisibilityRealm;
    create: VisibilityRealm;
    update: VisibilityRealm;
    delete: VisibilityRealm;
    mergePatchRealm: JsonMergePatchRealm;
  };
  #program: Program;

  constructor(emitter: AssetEmitter<string>) {
    super(emitter);
    this.#program = emitter.getProgram();
    const updateRealm = new VisibilityRealm(this.#program, "update");
    this.#realms = {
      read: new VisibilityRealm(this.#program, "read"),
      query: new VisibilityRealm(this.#program, "query"),
      create: new VisibilityRealm(this.#program, "create"),
      update: updateRealm,
      delete: new VisibilityRealm(this.#program, "delete"),
      mergePatchRealm: new JsonMergePatchRealm(this.#program, updateRealm),
    };

    this.#jsonSchemaEmitter = this.emitter.getEmitContext().getAssetEmitter(JsonSchemaEmitter);
    this.#typescriptEmitter = this.emitter.getEmitContext().getAssetEmitter(TSRPCInterfaceEmitter, {
      realms: { ...this.#realms, update: this.#realms.mergePatchRealm },
    });
  }

  program(program: Program) {
    // todo: fix this cast
    const jsonRpcs = getJsonRpcs({ program }) as IterableIterator<Interface>;
    for (const rpc of jsonRpcs) {
      this.#typescriptEmitter.emitType(rpc);
      for (const op of rpc.operations.values()) {
        const inputRealm = operationInputRealm(program, op)!; // todo: handle no specified visibility?
        const declOfInputTypeRealm = new ExprToDeclRealm(program, inputRealm);
        const outputRealm = new VisibilityRealm(program, "read");
        const declOfOutputTypeRealm = new ExprToDeclRealm(program, outputRealm);
        for (const prop of op.parameters.properties.values()) {
          if (prop.type.kind === "ModelProperty") {
            // model property references don't apply visibility;
            this.#jsonSchemaEmitter.emitType(prop.type);
            continue;
          }
          const clonedPropType = declOfInputTypeRealm.cloneExprToDecl(
            prop.type,
            op.name + prop.name + "Parameter",
            rpc.namespace!
          );

          this.#jsonSchemaEmitter.emitType(clonedPropType, {
            lexicalContext: { realmKey: declOfInputTypeRealm.key },
          });
        }
        if (op.returnType.kind === "Model") {
          const clonedReturnType = declOfOutputTypeRealm.cloneExprToDecl(
            op.returnType,
            op.name + "ReturnType",
            rpc.namespace!
          );
          this.#jsonSchemaEmitter.emitType(clonedReturnType, {
            lexicalContext: { realmKey: declOfOutputTypeRealm.key },
          });
        }
      }
    }
    console.log("Finished with program");
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

function operationInputRealm(program: Program, operation: Operation) {
  const appliedVis = getOperationVisibility(program, operation);
  if (!appliedVis) {
    return null;
  }

  const realm = new VisibilityRealm(program, appliedVis);
  const withVis = realm.clone(operation.parameters);

  if (appliedVis === "update") {
    const patchRealm = new JsonMergePatchRealm(program, realm);
    patchRealm.cloneAsUpdatable(withVis);
    return patchRealm;
  } else {
    return realm;
  }
}
