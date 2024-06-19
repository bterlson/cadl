import { ComponentChildren } from "#jsx/jsx-runtime";
import { Model } from "@typespec/compiler";
import { Declaration } from "../framework/components/declaration.js";
import { code } from "../framework/core/code.js";
import { useNamePolicy } from "../framework/core/name-policy.js";
import { filterComponentFromChildren } from "../framework/utils/children-component-utils.js";
import { InterfaceExpression } from "./interface-expression.js";
import { Reference } from "./reference.js";

export interface IntersectionDeclarationProps {
  type?: Model;
  name?: string;
  children?: ComponentChildren;
}

export function IntersectionDeclaration({
  type,
  name,
  children: allChildren,
}: IntersectionDeclarationProps) {
  const namer = useNamePolicy();
  let intersectionName = name ?? "___NoName___";

  if (!name && type) {
    intersectionName = namer.getName(type, "interface");
  }

  const [constituents, children] = filterComponentFromChildren(
    allChildren,
    IntersectionConstituent
  );

  if (type?.baseModel) {
    constituents.push(<Reference refkey={type.baseModel} />);
  }

  return (
    <Declaration name={intersectionName} refkey={type}>
      export type {intersectionName} =
      {constituents.map((constituent) => {
        return code`
        ${constituent} &`;
      })}
      {type ? <InterfaceExpression type={type}>{children}</InterfaceExpression> : <>{children}</>}
    </Declaration>
  );
}

export interface IntersectionConstituentProps {
  type?: Model;
  children?: ComponentChildren;
}

export function IntersectionConstituent({ type, children }: IntersectionConstituentProps) {
  const typeReference = type ? <Reference refkey={type} /> : <></>;

  return (
    <>
      {typeReference} {children}
    </>
  );
}
