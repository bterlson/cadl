import { Type } from "@typespec/compiler";
import { ClassDeclaration } from "./class-declaration.js";
import { UnionDeclaration } from "./union-declaration.js";
import { EnumDeclaration } from "./enum-declaration.js";

export interface TypeDeclarationProps {
  type: Type;
}

export function TypeDeclaration({ type }: TypeDeclarationProps) {
  switch (type.kind) {
    case "Model":
      return <ClassDeclaration type={type} />;
    case "Union":
      return <UnionDeclaration type={type} />;
    case "Enum":
      return <EnumDeclaration type={type} />;
    default:
      throw new Error("Not yet supported");
  }
}
