import {
  DecoratorContext,
  EmitContext,
  Interface,
  isArrayModelType,
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
  Context,
  EmitterOutput,
  SourceFile,
} from "@typespec/compiler/emitter-framework";
import { JsonSchemaEmitter } from "@typespec/json-schema";
import { TypeScriptInterfaceEmitter } from "../vendor/ts-interface-emitter/typescript-emitter.js";
import { createStateSymbol } from "./lib.js";
export * from "./expressAdapter.js";

export async function $onEmit(context: EmitContext) {
  const jsonSchemaEmitter = context.getAssetEmitter(JsonSchemaEmitter as any, {
    emitAllRefs: true,
  });
  const typescriptEmitter = context.getAssetEmitter(TSRPCInterfaceEmitter);
  const program = context.program;

  const jsonRpcs = getJsonRpcs({ program }) as IterableIterator<Interface>;
  for (const rpc of jsonRpcs) {
    typescriptEmitter.emitType(rpc);
    for (const op of rpc.operations.values()) {
      for (const prop of op.parameters.properties.values()) {
        if (prop.type.kind === "ModelProperty") {
          // model property references don't apply visibility;
          jsonSchemaEmitter.emitType(prop.type);
          continue;
        }
        const cloneProp = mutateSubgraph(
          program,
          [declarationMutator(op.name + prop.name + "Parameter")],
          prop.type as any
        );
        jsonSchemaEmitter.emitType(cloneProp.type);
      }
      if (op.returnType.kind === "Model") {
        const clonedReturnType = mutateSubgraph(
          program,
          [declarationMutator(op.name + "ReturnType")],
          op.returnType
        );
        jsonSchemaEmitter.emitType(clonedReturnType.type);
      }
    }
  }

  await jsonSchemaEmitter.writeOutput();
  await typescriptEmitter.writeOutput();
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
    const appliedVis = getOperationVisibility(this.#program, operation);
    if (!appliedVis) {
      return super.operationParameters(operation, parameters);
    }

    if (appliedVis === "update") {
      const clone = mutateSubgraph(
        this.#program,
        [Mutators.Visibility.update, Mutators.JSONMergePatch],
        parameters
      );
      return super.operationParameters(operation, clone.type);
    } else {
      const clone = mutateSubgraph(this.#program, [Mutators.Visibility[appliedVis]], parameters);
      return super.operationParameters(operation, clone.type);
    }
  }

  operationReturnTypeReferenceContext(operation: Operation, returnType: Type): Context {
    this.emitter.enableMutator(Mutators.Visibility.read);
    return {};
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
      filter(m, program) {
        if (m.name && !(isArrayModelType(program, m) && m.name === "Array")) {
          return MutatorFlow.DontRecurse | MutatorFlow.DontMutate;
        } else {
          return MutatorFlow.DontRecurse;
        }
      },
      mutate(m, clone) {
        clone.name = name;
        console.log("Set name to ", name);
      },
    },
  };
}
