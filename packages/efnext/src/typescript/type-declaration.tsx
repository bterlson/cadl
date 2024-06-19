import { Type } from "@typespec/compiler";
import { InterfaceDeclaration } from "./interface-declaration.js";
import { UnionDeclaration } from "./union-declaration.js";

export interface TypeDeclarationProps {
  type: Type;
}

export function TypeDeclaration({ type }: TypeDeclarationProps) {
  switch (type.kind) {
    case "Model":
      return <InterfaceDeclaration type={type} />;
    case "Union":
      return <UnionDeclaration type={type} />;
    default:
      throw new Error("Not yet supported");
  }
}
