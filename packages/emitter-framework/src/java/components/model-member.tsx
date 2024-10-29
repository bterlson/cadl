import { code } from "@alloy-js/core";
import { Variable } from "@alloy-js/java";
import { ModelProperty, Union } from "@typespec/compiler";
import { intrinsicNameToJavaType, TypeExpression } from "./type-expression.js";

export interface ModelMemberProps {
  type: ModelProperty;
}

/**
 * Define member of model
 */
export function ModelMember({ type }: ModelMemberProps) {
  const isUnion = type.type.kind === "Union";

  const variable = <Variable private type={<TypeExpression type={type} />} name={type.name} />;

  return (
    <>
      {isUnion
        ? code`
        /**
        * Represents union types [${Array.from((type.type as Union).variants.values())
          // @ts-expect-error If fails return nothing
          .map((v) => intrinsicNameToJavaType.get(v.type.name))
          .join(", ")}]
        */
        ${variable}
      `
        : variable}
    </>
  );
}
