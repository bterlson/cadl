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
  (sourceType: T, program: Program, realm: Realm): boolean | MutatorFlow;
}

export interface Mutator {
  name: string;
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

export enum MutatorFlow {
  MutateAndRecurse = 0,
  DontMutate = 1 << 0,
  DontRecurse = 1 << 1,
}

export function createVisibilityMutator(visibility: string): Mutator {
  return {
    name: visibility + " Visibility",
    Model: {
      filter(m, program, realm) {
        if (isArrayModelType(program, m)) {
          return MutatorFlow.DontMutate;
        }

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
  name: "JSON Merge Patch",
  Model: {
    filter(m, program, realm) {
      return isArrayModelType(program, m) ? MutatorFlow.DontRecurse | MutatorFlow.DontMutate : true;
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
  mutators: Mutator[],
  type: T
): { realm: Realm | null; type: T } {
  const realm = new Realm(program, "realm for mutation");
  const interstitials: (() => void)[] = [];

  const mutated = mutateSubgraphWorker(type, new Set(mutators));

  if (mutated === type) {
    return { realm: null, type };
  } else {
    return { realm, type: mutated };
  }

  function mutateSubgraphWorker<T extends MutatableType>(type: T, activeMutators: Set<Mutator>): T {
    const existing = seen.get([type, activeMutators]);
    if (existing) {
      cloneInterstitials();
      return existing as T;
    }

    let sourceType = type;
    let clone: T | null = null;

    for (const mutator of activeMutators) {
      const record = mutator[type.kind] as MutatorRecord<T> | undefined;
      let mutationFn: MutatorFn<T> | null = null;
      let mutate = false;
      let recurse = false;

      if (!record) {
        continue;
      }
      if (typeof record === "function") {
        mutationFn = record;
        mutate = true;
        recurse = true;
      } else {
        mutationFn = record.mutate;
        if (record.filter) {
          const filterResult = record.filter(sourceType, program, realm);
          if (filterResult === true) {
            mutate = true;
            recurse = true;
          } else if (filterResult === false) {
            mutate = false;
            recurse = true;
          } else {
            mutate = (filterResult & MutatorFlow.DontMutate) === 0;
            recurse = (filterResult & MutatorFlow.DontRecurse) === 0;
          }
        } else {
          mutate = true;
          recurse = true;
        }
      }

      if (mutate) {
        cloneInterstitials();
        initializeClone();
        mutationFn!(sourceType, clone!, program, realm);
      }

      if (!recurse) {
        activeMutators.delete(mutator);
      }
    }

    if (!clone) {
      interstitials.push(initializeClone);
    }

    visitSubgraph();

    if (clone) {
      realm.typeFactory.finishType(clone);
      return clone;
    }

    return type;

    function initializeClone() {
      clone = realm.typeFactory.initializeClone(sourceType);
      seen.set([type, activeMutators], clone);
      sourceType = clone;
    }

    function cloneInterstitials() {
      for (const interstitial of interstitials) {
        interstitial();
      }

      interstitials.length = 0;
    }

    function visitSubgraph<T extends MutatableType>() {
      const root = clone ?? type;
      switch (root.kind) {
        case "Model":
          for (const prop of root.properties.values()) {
            const newProp = mutateSubgraphWorker(prop, activeMutators);

            if (clone) {
              (clone as any).properties.set(prop.name, newProp);
            }
          }
          if (root.indexer) {
            const res = mutateSubgraphWorker(root.indexer.value as any, activeMutators);
            if (clone) {
              (clone as any).indexer.value = res;
            }
          }
          break;
        case "ModelProperty":
          const newType = mutateSubgraphWorker(root.type as MutatableType, activeMutators);
          if (clone) {
            (clone as any).type = newType;
          }

          break;
        case "Operation":
          const newParams = mutateSubgraphWorker(root.parameters, activeMutators);
          if (clone) {
            (clone as any).parameters = newParams;
          }

          break;
      }
    }
  }
}
