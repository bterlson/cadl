import { Union } from "@typespec/compiler";
import { Declaration } from "../framework/components/declaration.js";
import { UnionExpression } from "./union-expression.js";

export interface UnionDeclarationProps {
  type: Union;
}

export function UnionDeclaration({ type }: UnionDeclarationProps) {
  return (
    <Declaration name={type.name!} refkey={type}>
      {type.name} = <UnionExpression type={type} />
    </Declaration>
  );
}
