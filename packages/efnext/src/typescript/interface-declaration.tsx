import { ComponentChildren } from "#jsx/jsx-runtime";
import { Interface, Model } from "@typespec/compiler";
import { Declaration } from "../framework/components/declaration.js";
import { useNamePolicy } from "../framework/core/name-policy.js";
import { isModel } from "../framework/utils/typeguards.js";
import { InterfaceExpression } from "./interface-expression.js";
import { Reference } from "./reference.js";

export interface InterfaceDeclarationProps {
  type?: Model | Interface;
  name?: string;
  children?: ComponentChildren;
}

export function InterfaceDeclaration({ type, name, children }: InterfaceDeclarationProps) {
  let extendsClause = undefined;

  const namer = useNamePolicy();
  let ifaceName = name ?? "___NoName___";

  if (!name && type) {
    ifaceName = namer.getName(type, "interface");
  }

  if (type && isModel(type) && type.baseModel) {
    extendsClause = (
      <>
        extends <Reference refkey={type.baseModel} />
      </>
    );
  }

  return (
    <Declaration name={ifaceName} refkey={type ?? ifaceName}>
      export interface {ifaceName} {extendsClause}{" "}
      <InterfaceExpression type={type}>{children}</InterfaceExpression>
    </Declaration>
  );
}
