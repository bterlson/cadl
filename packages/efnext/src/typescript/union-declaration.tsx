import { Enum, Union } from "@typespec/compiler";
import { Declaration } from "../framework/components/declaration.js";
import { UnionExpression } from "./union-expression.js";

export interface UnionDeclarationProps {
  type: Union | Enum;
  name?: string;
}

export function UnionDeclaration({ type, name }: UnionDeclarationProps) {
  const unionName = name ?? type.name!;
  return (
    <Declaration name={unionName} refkey={type}>
      export type {type.name} = <UnionExpression type={type} />;
    </Declaration>
  );
}
