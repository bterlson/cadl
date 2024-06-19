import { ComponentChildren } from "#jsx/jsx-runtime";
import { ModelProperty, Operation } from "@typespec/compiler";
import { useNamePolicy } from "../framework/core/name-policy.js";
import { filterComponentFromChildren } from "../framework/utils/children-component-utils.js";
import { isModelProperty, isOperation } from "../framework/utils/typeguards.js";
import { FunctionDeclaration } from "./function-declaration.js";
import { TypeExpression } from "./type-expression.js";

export interface InterfaceMemberProps {
  type: ModelProperty | Operation;
  children?: ComponentChildren;
}

export function InterfaceMember({ type, children: allChildren }: InterfaceMemberProps) {
  const namer = useNamePolicy();
  const name = namer.getName(type, "interfaceMember");
  if (isModelProperty(type)) {
    return (
      <>
        "{name}"{type.optional && "?"}: <TypeExpression type={type.type} />;
      </>
    );
  }

  if (isOperation(type)) {
    const [customReturnType] = filterComponentFromChildren(
      allChildren,
      FunctionDeclaration.ReturnType
    );

    const returnType = customReturnType.length ? (
      <>{customReturnType}</>
    ) : (
      <TypeExpression type={type.returnType} />
    );

    return (
      <>
        {name}(<FunctionDeclaration.Parameters type={type.parameters} />
        ): {returnType};
      </>
    );
  }
}
