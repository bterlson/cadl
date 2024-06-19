import { Union } from "@typespec/compiler";
import { stdlib } from "./builtins.js";
import { Reference } from "./reference.js";
import { TypeExpression } from "./type-expression.js";
import { mapWithSep, withSep } from "./utils.js";

export interface UnionExpressionProps {
  type: Union;
}

export function UnionExpression({ type }: UnionExpressionProps) {
  const children = mapWithSep(type.variants.values(), (variant) => {
    return <TypeExpression type={variant.type} />;
  });
  
  return <><Reference builtin={stdlib.typing.Union} />[{children}]</>;
}
