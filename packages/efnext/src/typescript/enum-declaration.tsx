import { ComponentChildren } from "#jsx/jsx-runtime";
import { Enum } from "@typespec/compiler";
import { Declaration } from "../framework/components/declaration.js";
import { Block } from "./block.js";
import { EnumExpression } from "./enum-expression.js";

export interface EnumDeclarationProps {
  type: Enum;
  children?: ComponentChildren;
}

export function EnumDeclaration({ type, children }: EnumDeclarationProps) {
  const members = [...type.members.values()];

  return (
    <Declaration name={type.name!} refkey={type}>
      export enum {type.name}{" "}
      <Block>
        {members.map((member) => (
          <EnumExpression type={member} />
        ))}
        {children}
      </Block>
    </Declaration>
  );
}
