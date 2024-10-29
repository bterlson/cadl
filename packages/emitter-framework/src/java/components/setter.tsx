import { code } from "@alloy-js/core";
import * as jv from "@alloy-js/java";
import { ModelProperty } from "@typespec/compiler";
import { getTemplateParams } from "../utils.js";
import { TypeExpression } from "./type-expression.js";

export interface SetterProps {
  type: ModelProperty;
}

/**
 * Generate setter for a model member
 */
export function Setter(props: SetterProps) {
  const accessName = props.type.name.charAt(0).toUpperCase() + props.type.name.slice(1);

  // Need to figure out model declaration so we can specify return type
  const generics = props?.type?.model?.node ? getTemplateParams(props.type.model.node) : undefined;
  const genericObject: Record<string, string> = {};
  generics?.forEach((generic) => (genericObject[generic] = ""));

  const returnType = code`${props.type.model?.name}${(generics?.length ?? 0) >= 1 ? <jv.Generics types={Object.keys(genericObject)} /> : ""}`;

  return (
    <jv.Method
      name={"set" + accessName}
      public
      return={returnType}
      parameters={{ [props.type.name]: <TypeExpression type={props.type} /> }}
    >
      {code`
        this.${props.type.name} = ${props.type.name};
        return this;
      `}
    </jv.Method>
  );
}
