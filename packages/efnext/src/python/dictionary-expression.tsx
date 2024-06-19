import { Type } from "@typespec/compiler";
import { TypeExpression } from "./type-expression.js";

export interface DictionaryExpressionProps {
  elementType: Type;
}

export function DictionaryExpression({ elementType }: DictionaryExpressionProps) {
  return (
    <>
      Dict[string, <TypeExpression type={elementType} />]
    </>
  );
}
