import { Model, Mutator, MutatorFlow, Type, isArrayModelType, isVisible } from "@typespec/compiler";
import { pascalCase } from "change-case";
import { TypeTracker } from "./type-tracker.js";

const VisibilityRenames: Record<string, string> = {
  read: "Output",
};

/**
 * Mutator object to transform operation and models with a visibility.
 * TODO: Fix issue with "update" visibility
 * @constant
 * @type {Mutator}
 */
export const createVisibilityMutator: (tracker: TypeTracker, visibility: string) => Mutator = (
  tracker,
  visibility
) => {
  const VisibilityModels = new WeakMap<Model, Record<string, Model>>();

  return {
    name: "rest-visibility-mutator",
    Model: {
      filter(m, program, realm) {
        if (isArrayModelType(program, m)) {
          return MutatorFlow.DontMutate;
        }

        let shouldMutate = false;
        for (const prop of m.properties.values()) {
          if (!isVisible(program, prop, [visibility])) {
            shouldMutate = true;
            break;
          }
        }

        return shouldMutate;
      },
      mutate(m, clone, program, realm) {
        if (clone.name) {
          const visibilityName = VisibilityRenames[visibility] ?? visibility;
          clone.name = pascalCase(`${m.name} ${visibilityName}`);
        }

        let haveSameProperties = true;

        for (const prop of m.properties.values()) {
          if (!isVisible(program, prop, [visibility])) {
            haveSameProperties = false;
            clone.properties.delete(prop.name);
            realm.remove(prop);
          }
        }

        if (haveSameProperties) {
          // If they are the same, we don't need to track the model
          // we keep the original.
          return;
        }

        tracker.track("model", clone);

        if (!VisibilityModels.has(m)) {
          VisibilityModels.set(m, {});
        }

        VisibilityModels.get(m)![visibility] = clone;

        return;
      },
    },
    Operation: {
      mutate(op, clone, program, realm) {
        // Mutate the operation so that the returnType is the model for "read"

        function getVisibilityType(type: Type): Type {
          if (type.kind === "Model") {
            if (isArrayModelType(program, type)) {
              const arrayElement = getVisibilityType(type.indexer.value);
              type.indexer!.value = arrayElement;
              return type;
            }

            return VisibilityModels.get(type)?.[visibility] ?? type;
          }

          if (type.kind === "Union") {
            for (const variant of type.variants.values()) {
              const visibilityType = getVisibilityType(variant.type);
              variant.type = visibilityType;
            }
          }

          // TODO: Handle other types
          return type;
        }

        clone.returnType = getVisibilityType(clone.returnType);
      },
    },
  };
};
