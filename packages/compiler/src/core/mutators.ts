import { getVisibility, isVisible } from "../index.js";
import { Program } from "./program.js";
import { Realm } from "./realm.js";
import { Model, Type } from "./types.js";

export type MutatorRecord<T extends Type, TOptions> =
  | {
      filter: MutatorFilterFn<T, TOptions>;
      mutate: MutatorFn<T, TOptions>;
    }
  | MutatorFn<T, TOptions>;

export interface MutatorFn<T extends Type, TOptions> {
  (type: T, clone: T, program: Program, realm: Realm, options: TOptions): void;
}

export interface MutatorFilterFn<T extends Type, TOptions> {
  (type: T, program: Program, realm: Realm, options: TOptions): boolean;
}

export interface Mutator<TOptions, TMutateOptions = any> {
  options: TOptions;
  model?: MutatorRecord<Model, TMutateOptions>;
  modelProperty?: MutatorRecord<Model, TMutateOptions>;
}

export interface VisibilityOptions {
  visibility: string;
}

export function createVisibilityMutator(visibility: string): Mutator<VisibilityOptions> {
  return {
    options: { visibility },
    model: {
      filter(m, program, realm) {
        for (const prop of m.properties.values()) {
          const propVisibility = getVisibility(program, prop);
          if (!propVisibility) {
            continue;
          }

          if (propVisibility.length > 1 || propVisibility[0] !== visibility) {
            return true;
          }
        }

        return false;
      },
      mutate(m, clone, program, realm) {
        clone.name = m.name + visibility.charAt(0).toUpperCase() + visibility.slice(1);
        for (const prop of m.properties.values()) {
          if (!isVisible(program, prop, [visibility])) {
            clone.properties.delete(prop.name);
            realm.remove(prop);
          }
        }
        console.log(clone.name, "properties:", [...clone.properties.keys()]);

        return;
      },
    },
  };
}

const JSONMergePatch: Mutator<any> = {
  options: {},

  model(m, clone, program, realm, next) {
    console.log("Making merge patch");
    if (clone.name) {
      console.log("Making merge patch for ", clone.name);
      clone.name = clone.name + "MergePatch";
    }

    for (const prop of clone.properties.values()) {
      if (prop.optional) {
        // TODO: Something about realms? probably realm should be aware of this type.
        prop.type = realm.typeFactory.union([prop.type, program.typeFactory.null]);
      }
      prop.optional = true;
    }
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
