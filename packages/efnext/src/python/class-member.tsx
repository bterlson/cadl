import { ModelProperty } from "@typespec/compiler";
import { TypeExpression } from "./type-expression.js";
import { useNamePolicy } from "../framework/core/name-policy.js";

export interface ClassMemberProps {
  type: ModelProperty;
}

export function ClassMember({ type }: ClassMemberProps) {
  const name = useNamePolicy().getName(type, "classMember");
  return (
    <>
      {name}: <TypeExpression type={type.type} />
    </>
  );
}
