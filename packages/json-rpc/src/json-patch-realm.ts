import {
  createRekeyableMap,
  Model,
  navigateType,
  Program,
  Realm,
  Type,
  Union,
  UnionVariant,
} from "@typespec/compiler";

export class JsonMergePatchRealm extends Realm {
  #program: Program;
  constructor(program: Program, parentRealm?: Realm) {
    super(program, "JsonMergePatch", parentRealm);
    this.#program = program;
  }

  cloneAsUpdatable(model: Model) {
    navigateType(
      model,
      {
        model: (m) => {
          const clone = super.clone(m);
          clone.name = m.name + "MergePatch";

          for (const [key, prop] of clone.properties) {
            const cloneProp = super.clone(prop);
            if (cloneProp.optional) {
              const unionType: Union = union(this.#program, [
                cloneProp.type,
                this.#program.resolveTypeReference("TypeSpec.null")[0]!,
              ]);
              const clonedUnion = this.clone(unionType);
              cloneProp.type = clonedUnion;
            }
            cloneProp.optional = true;
            clone.properties.set(key, cloneProp);
          }
        },
      },
      {}
    );

    return this.map(model)!;
  }
}

function union(program: Program, variantTypes: Type[]): Union {
  const unionType: Union = program.checker.createType({
    kind: "Union",
    node: undefined as any,
    get options() {
      return Array.from(this.variants.values()).map((v) => v.type);
    },
    expression: true,
    variants: createRekeyableMap(),
    decorators: [],
  });

  for (const variantType of variantTypes) {
    if (variantType.kind === "Union") {
      for (const subVariant of unionType.variants.values()) {
        unionType.variants.set(subVariant.name, subVariant);
      }
    } else if (variantType === program.checker.neverType) {
      continue;
    } else {
      const name = Symbol("name");
      const variant: UnionVariant = program.checker.createType({
        kind: "UnionVariant",
        type: variantType,
        name,
        decorators: [],
        node: undefined,
        union: unionType,
      });

      unionType.variants.set(name, variant);
    }
  }

  return unionType;
}
