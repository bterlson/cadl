import { Scalar } from "@typespec/compiler";
import { Declaration } from "../framework/components/declaration.js";
import { TypeExpression } from "./type-expression.js";

export interface ScalarDeclarationProps {
  type: Scalar;
}

export function ScalarDeclaration({ type }: ScalarDeclarationProps) {
  return (
    <Declaration name={type.name!} refkey={type}>
      export type {type.name} = <TypeExpression type={type.baseScalar!} />;
    </Declaration>
  );
}
