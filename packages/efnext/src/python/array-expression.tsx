import { Type } from "@typespec/compiler";
import { TypeExpression } from "./type-expression.js";
import { stdlib } from "./builtins.js";
import { Reference } from "./reference.js";

export interface ArrayExpressionProps {
  elementType: Type;
}

export function ArrayExpression({ elementType }: ArrayExpressionProps) {
  return (
    <>
      <Reference builtin={stdlib.typing.List} />[
      <TypeExpression type={elementType} />]
    </>
  );
}
