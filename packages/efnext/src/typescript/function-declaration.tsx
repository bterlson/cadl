import { ComponentChildren, SourceNode } from "#jsx/jsx-runtime";
import { Model, ModelProperty, Operation, Union } from "@typespec/compiler";
import { Declaration } from "../framework/components/declaration.js";
import { code } from "../framework/core/code.js";
import { useNamePolicy } from "../framework/core/name-policy.js";
import { filterComponentFromChildren } from "../framework/utils/children-component-utils.js";
import { Block } from "./block.js";
import { TypeExpression } from "./type-expression.js";

export interface FunctionDeclarationProps {
  type?: Operation;
  refkey?: unknown;
  name?: string;
  parameters?: Record<string, string>;
  children?: ComponentChildren;
}

export function FunctionDeclaration({
  type,
  parameters,
  name,
  refkey,
  children: allChildren,
}: FunctionDeclarationProps) {
  const functionName = name ?? useNamePolicy().getName(type!, "function");

  const [parametersChild, childrenWithNoParams] = filterComponentFromChildren(
    allChildren,
    FunctionDeclaration.Parameters
  );
  const [bodyChild, childrenWithNoBody] = filterComponentFromChildren(
    childrenWithNoParams,
    FunctionDeclaration.Body
  );
  const [customReturnType, children] = filterComponentFromChildren(
    childrenWithNoBody,
    FunctionDeclaration.ReturnType
  );

  let sReturnType = type?.returnType ? (
    <>
      :<TypeExpression type={type.returnType} />
    </>
  ) : undefined;

  if (customReturnType?.length) {
    sReturnType = <>: {customReturnType}</>;
  }

  const sParams = parametersChild?.length ? (
    parametersChild
  ) : (
    <FunctionDeclaration.Parameters type={type?.parameters} parameters={parameters} />
  );

  const sBody = bodyChild?.length ? (
    bodyChild
  ) : (
    <FunctionDeclaration.Body>{children}</FunctionDeclaration.Body>
  );

  return (
    <Declaration name={functionName} refkey={refkey ?? type}>
      export function {functionName} ({sParams}) {sReturnType}
      <Block>{sBody}</Block>
    </Declaration>
  );
}

export interface FunctionParametersProps {
  type?: Model;
  parameters?: Record<string, string> | ModelProperty[];
  children?: SourceNode[];
}

FunctionDeclaration.Parameters = function Parameters({
  type,
  parameters,
  children,
}: FunctionParametersProps) {
  if (children) {
    return children;
  } else if (parameters) {
    if (Array.isArray(parameters)) {
      return buildParameters(parameters);
    }
    return Object.entries(parameters).map(([key, value]) => [key, ":", value, ","]);
  } else {
    const params = Array.from(type?.properties.values() ?? []);
    return <WrappingParameter type={type}>{buildParameters(params)}</WrappingParameter>;
  }
};

function buildParameters(params: ModelProperty[]): SourceNode[] {
  return params.map((param, index) => {
    const isLast = index === params.length - 1;
    const optionality = param.optional ? "?" : "";
    return (
      <>
        {param.name}
        {optionality}: <TypeExpression type={param.type} />
        {!isLast ? ", " : ""}
      </>
    );
  });
}

function WrappingParameter({ type, children }: { type?: Model; children?: ComponentChildren }) {
  if (!type || !type.name) {
    return <>{children}</>;
  }

  const paramName = type.name; // TODO: rename
  return code`
  ${paramName}: {${children}}
  `;
}

export interface FunctionBodyProps {
  operation?: Operation;
  children?: SourceNode[];
}

FunctionDeclaration.Body = function Body({ operation, children }: FunctionBodyProps) {
  return children;
};

export interface FunctionReturnTypeProps {
  type?: Model | Union;
  children?: SourceNode[];
}

FunctionDeclaration.ReturnType = function ReturnType({ type, children }: FunctionReturnTypeProps) {
  if (children) {
    return children;
  } else if (type) {
    return <TypeExpression type={type} />;
  }

  return <></>;
};
