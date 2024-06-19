import { ComponentChildren } from "#jsx/jsx-runtime";
import { Model } from "@typespec/compiler";
import { Declaration } from "../framework/components/declaration.js";
import { code } from "../framework/core/code.js";
import { useNamePolicy } from "../framework/core/name-policy.js";
import { mapWithSep } from "./utils.js";
import { ClassMember } from "./class-member.js";

export interface ClassDeclarationProps {
  type: Model;
  name?: string;
  children?: ComponentChildren;
}

export function ClassDeclaration({ type, name, children }: ClassDeclarationProps) {
  const namer = useNamePolicy();
  const className = name ?? namer.getName(type, "class");
  const members = mapWithSep(type.properties.values(), (prop) => {
    return <ClassMember type={prop} />
  }, "\n")

  return (
    <Declaration name={className} refkey={type}>
      {code`
        class ${className}:
          ${members}
          ${children}
      `}
    </Declaration>
  );
}
