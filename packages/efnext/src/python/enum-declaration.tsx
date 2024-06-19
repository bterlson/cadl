import { ComponentChildren } from "#jsx/jsx-runtime";
import { Enum } from "@typespec/compiler";
import { Declaration } from "../framework/components/declaration.js";
import { code } from "../framework/core/code.js";
import { mapWithSep } from "./utils.js";
import { useNamePolicy } from "../framework/core/name-policy.js";
import { Reference } from "./reference.js";
import { stdlib } from "./builtins.js";

export interface EnumDeclarationProps {
  type: Enum;
  children?: ComponentChildren;
}

export function EnumDeclaration({ type, children }: EnumDeclarationProps) {
  const namer = useNamePolicy();

  const members = mapWithSep(type.members.values(), (value) => {
    if (value.value) {
      // todo: probably delegate to a value-producing component
      return `${namer.getName(value, "enumMember")} = ${JSON.stringify(value)}`;
    } else {
      return `${namer.getName(value, "enumMember")} = "${value.name}"`
    }
  }, "\n");

  return (
    <Declaration name={type.name!} refkey={type}>
      {code`
        class ${type.name}(${<Reference builtin={stdlib.enum.Enum} />}):
          ${members}
          ${children}
      `}
    </Declaration>
  );
}
