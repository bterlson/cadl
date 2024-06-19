import { BooleanLiteral, NumericLiteral, StringLiteral } from "@typespec/compiler";

export interface TypeLiteralProps {
  type: BooleanLiteral | StringLiteral | NumericLiteral;
}

export function TypeLiteral({ type }: TypeLiteralProps) {
  switch (type.kind) {
    case "Boolean":
    case "Number":
      return String(type.value);
    case "String":
      return `"${type.value}"`;
  }
}
