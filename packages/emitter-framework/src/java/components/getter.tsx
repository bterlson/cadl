import * as jv from "@alloy-js/java";
import { ModelProperty } from "@typespec/compiler";
import { TypeExpression } from "./type-expression.js";

export interface GetterProps {
  type: ModelProperty;
}

/**
 * Generate getter for a model member
 */
export function Getter(props: GetterProps) {
  const accessName = props.type.name.charAt(0).toUpperCase() + props.type.name.slice(1);

  return (
    <jv.Method name={"get" + accessName} return={<TypeExpression type={props.type} />} public>
      return this.{props.type.name};
    </jv.Method>
  );
}
