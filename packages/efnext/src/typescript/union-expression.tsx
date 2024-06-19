import { Enum, Union } from "@typespec/compiler";
import { mapWithSep } from "../python/utils.js";
import { TypeExpression } from "./type-expression.js";
import { Value } from "./value.js";

export interface UnionExpressionProps {
  type: Union | Enum;
}

export function UnionExpression({ type }: UnionExpressionProps) {
  if (type.kind === "Enum") {
    const members = Array.from(type.members.values());
    return (
      <>
        {mapWithSep(
          members,
          (member) => {
            return <Value jsValue={member.value ?? member.name} />;
          },
          " | "
        )}
      </>
    );
  } else if (type.kind === "Union") {
    const variants = Array.from(type.variants.values());
    return (
      <>
        {variants.map((variant, index) => {
          const isLast = index === variants.length - 1;
          return (
            <>
              <TypeExpression type={variant.type} /> {!isLast && " | "}
            </>
          );
        })}
      </>
    );
  } else {
    // Should be unreachable
    throw new Error(`Unexpected type kind: ${(type as any).kind}`);
  }
}
