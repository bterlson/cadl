import { Namespace, Program, Realm, Type } from "@typespec/compiler";

let count = 0;
export class ExprToDeclRealm extends Realm {
  #program: Program;
  constructor(program: Program, parentRealm?: Realm) {
    super(program, "ExprToDecl-" + count++, parentRealm);
    this.#program = program;
  }

  cloneExprToDecl(type: Type, name: string, namespace: Namespace) {
    // todo: cleanup
    if ("name" in type && type.name !== undefined) {
      return type;
    }
    const clone: any = super.clone(type);

    switch (clone.kind) {
      case "Model":
      case "Union":
        clone.name = name;
        clone.namespace = namespace;
        break;
      default:
        throw new Error("Can't convert type to decl: " + clone.kind);
    }
    return clone;
  }
}
