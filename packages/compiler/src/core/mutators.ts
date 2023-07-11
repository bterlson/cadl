import { CustomKeyMap } from "../emitter-framework/custom-key-map.js";
import { isArrayModelType, isVisible } from "../index.js";
import { Program } from "./program.js";
import { Realm } from "./realm.js";
import {
  Decorator,
  Enum,
  EnumMember,
  FunctionParameter,
  FunctionType,
  Interface,
  IntrinsicType,
  Model,
  ModelProperty,
  Namespace,
  ObjectType,
  Operation,
  Projection,
  Scalar,
  TemplateParameter,
  Tuple,
  Type,
  Union,
  UnionVariant,
} from "./types.js";

export type MutatorRecord<T extends Type> =
  | {
      filter?: MutatorFilterFn<T>;
      mutate: MutatorFn<T>;
    }
  | MutatorFn<T>;

export interface MutatorFn<T extends Type> {
  (sourceType: T, clone: T, program: Program, realm: Realm): void;
}

export interface MutatorFilterFn<T extends Type> {
  (sourceType: T, program: Program, realm: Realm): boolean;
}

export interface Mutator {
  startFilter?(sourceType: Type, program: Program): boolean;
  Model?: MutatorRecord<Model>;
  ModelProperty?: MutatorRecord<ModelProperty>;
  Scalar?: MutatorRecord<Scalar>;
  Enum?: MutatorRecord<Enum>;
  EnumMember?: MutatorRecord<EnumMember>;
  Union?: MutatorRecord<Union>;
  UnionVariant?: MutatorRecord<UnionVariant>;
  Tuple?: MutatorRecord<Tuple>;
  Operation?: MutatorRecord<Operation>;
  Interface?: MutatorRecord<Interface>;
  String?: MutatorRecord<Scalar>;
  Number?: MutatorRecord<Scalar>;
  Boolean?: MutatorRecord<Scalar>;
}

export interface VisibilityOptions {
  visibility: string;
}

const passthrough: MutatorRecord<any> = {
  filter() {
    return true;
  },
  mutate(t) {
    return t;
  },
};

export function createVisibilityMutator(visibility: string): Mutator {
  return {
    ModelProperty: passthrough,
    Model: {
      filter(m, program, realm) {
        return true;
      },
      mutate(m, clone, program, realm) {
        if (isArrayModelType(program, m)) {
          return;
        }
        if (clone.name) {
          clone.name = m.name + visibility.charAt(0).toUpperCase() + visibility.slice(1);
        }

        for (const prop of m.properties.values()) {
          if (!isVisible(program, prop, [visibility])) {
            clone.properties.delete(prop.name);
            realm.remove(prop);
          }
        }
        return;
      },
    },
  };
}

const JSONMergePatch: Mutator = {
  ModelProperty: passthrough,
  Model: {
    filter(m, program, realm) {
      return !isArrayModelType(program, m);
    },
    mutate(sourceType, clone, program, realm) {
      if (clone.name) {
        clone.name = clone.name + "MergePatch";
      }

      for (const prop of clone.properties.values()) {
        if (prop.optional) {
          prop.type = realm.typeFactory.union([prop.type, program.typeFactory.null]);
        }
        prop.optional = true;
      }
    },
  },
};

export const Mutators = {
  Visibility: {
    create: createVisibilityMutator("create"),
    read: createVisibilityMutator("read"),
    update: createVisibilityMutator("update"),
    delete: createVisibilityMutator("delete"),
    query: createVisibilityMutator("query"),
  },
  JSONMergePatch,
};

/*
model A {
  @visibility("read") id: string;
  b: B;
  bArr: B[];
  c: C;
}

model B {}

model C {
  prop: string;
}

op Foo(m: A): void;

Flow:
* Visit A
  Clone A
  Mutate A (Visibility)
  Mutate A (Merge Patch)
  Walk A's references
  * Visit B
    Clone B
    Mutate B (Visibility)
    Mutate B (Merge patch)
    Finish BUpdateMergePatch
  * Visit B[]
    Clone B[]
    Mutate B[] (Merge patch, control flow, disable mutation for subgraph rooted at indexer value)
    * Visit B
      Mutate B (Visibility)
      Finish BUpdate
    Finish BUpdate[]
  * Visit C
    Clone C
    Mutate C (Merge patch)
    Finish CMergePatch
  Finish AUpdateMergePatch


AUpdateMergePatch
BUpdateMergePatch
CUpdateMergePatch

Model A {
  @visibility("read") id: string;
  b: B;
}

model B {
  c: C;
}

model C {
  @visibility("read") id: string;
  prop: string;
}

AUpdateMergePatch
BMergePatch
CMergePatch

// but if C doesn't have visibility changes....
Model A {
  @visibility("read") id: string;
  b: B;
}

model B {
  c: C;
}

model C {
  id: string;
  prop: string;
}


Flow:
* Visit A
  Clone A
  Mutate A (Visibility)
*/

type MutatableType = Exclude<
  Type,
  | TemplateParameter
  | Namespace
  | IntrinsicType
  | FunctionType
  | Decorator
  | FunctionParameter
  | ObjectType
  | Projection
>;
const typeId = CustomKeyMap.objectKeyer();
const mutatorId = CustomKeyMap.objectKeyer();
const seen = new CustomKeyMap<[MutatableType, Set<Mutator>], Type>(([type, mutators]) => {
  return `${typeId.getKey(type)}-${[...mutators.values()]
    .map((v) => mutatorId.getKey(v))
    .join("-")}`;
});
export function mutateSubgraph<T extends MutatableType>(
  program: Program,
  mutators: Set<Mutator>,
  type: T
): { realm: Realm | null; type: T } {
  const realm = new Realm(program, "realm for mutation");
  const mutated = mutateSubgraphWorker(type, mutators);

  if (mutated === type) {
    return { realm: null, type };
  } else {
    return { realm, type: mutated };
  }

  function mutateSubgraphWorker<T extends MutatableType>(type: T, activeMutators: Set<Mutator>): T {
    const existing = seen.get([type, activeMutators]);
    if (existing) {
      return existing as T;
    }

    const newActiveMutators = new Set(activeMutators.values());
    let sourceType = type;
    let clone: T | null = null;

    for (const mutator of activeMutators) {
      const record = mutator[type.kind] as MutatorRecord<T>;
      let applyMutation = false;
      let mutationFn;

      if (typeof record === "function") {
        mutationFn = record;
      } else if (typeof record === "object") {
        if (record.filter) {
          applyMutation = record.filter(sourceType, program, realm);
        } else {
          applyMutation = true;
        }
        mutationFn = record.mutate;
      }

      if (!applyMutation) {
        newActiveMutators.delete(mutator);
        continue;
      }

      if (mutationFn) {
        initializeClone();
        mutationFn(sourceType, clone!, program, realm);
      }
    }

    if (clone) {
      if (newActiveMutators.size > 0) {
        visitSubgraph(clone);
      }

      realm.typeFactory.finishType(clone);
    }

    return clone ?? type;

    function initializeClone() {
      clone = realm.typeFactory.initializeClone(sourceType);
      seen.set([type, newActiveMutators], clone);
      sourceType = clone;
    }
    function visitSubgraph<T extends MutatableType>(root: T) {
      switch (root.kind) {
        case "Model":
          for (const prop of root.properties.values()) {
            const newProp = mutateSubgraphWorker(prop, newActiveMutators);
            root.properties.set(prop.name, newProp);
          }
          if (root.indexer) {
            root.indexer.value = mutateSubgraphWorker(root.indexer.value as any, newActiveMutators);
          }
          break;
        case "ModelProperty":
          root.type = mutateSubgraphWorker(root.type as MutatableType, newActiveMutators);
          break;
        case "Operation":
          root.parameters = mutateSubgraphWorker(root.parameters, newActiveMutators);
          break;
      }
    }
  }
}
