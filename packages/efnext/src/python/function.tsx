import { SourceNode } from "#jsx/jsx-runtime";
import { Model, Operation } from "@typespec/compiler";
import { Declaration } from "../framework/components/declaration.js";
import { code } from "../framework/core/code.js";
import { useNamePolicy } from "../framework/core/name-policy.js";
import { coerceArray } from "../framework/utils/coerce-array.js";
import { TypeExpression } from "./type-expression.js";

export interface FunctionProps {
  type?: Operation;
  name?: string;
  refkey?: unknown;
  children?: SourceNode[];
}

export function Function({ type, name, children, refkey }: FunctionProps) {
  const functionName = name ?? useNamePolicy().getName(type!, "function");
  const parameters = type?.parameters;
  const parametersChild = coerceArray(children)?.find(
    (child: any) => child.type === Function.Parameters
  );
  const bodyChild = coerceArray(children)?.find((child: any) => child.type === Function.Body);
  const sReturnType = type?.returnType ? <TypeExpression type={type.returnType} /> : undefined;
  const sParams = parametersChild ? (
    parametersChild
  ) : (
    <Function.Parameters parameters={parameters} />
  );

  let sBody = bodyChild ? bodyChild : <Function.Body>{children}</Function.Body>;

  return (
    <Declaration name={functionName} refkey={refkey ?? type}>
      {code`
        def ${functionName}(${sParams}) -> ${sReturnType}:
          ${sBody}
      `}
    </Declaration>
  );
}

export interface FunctionParametersProps {
  parameters?: Model;
  children?: SourceNode[];
}

// todo: update to be inline with typescript framework
Function.Parameters = function Parameters({ parameters, children }: FunctionParametersProps) {
  const namer = useNamePolicy();
  if (children) {
    return children;
  } else {
    const params = Array.from(parameters?.properties.values() ?? []);
    return (
      <>
        {params.map((param, index) => {
          const isLast = index === params.length - 1;
          const optionality = param.optional ? "?" : "";
          return (
            <>
              {namer.getName(param, "parameter")}
              {optionality}: <TypeExpression type={param.type} />
              {!isLast ? ", " : ""}
            </>
          );
        })}
      </>
    );
  }
};

export interface FunctionBodyProps {
  operation?: Operation;
  children?: SourceNode[];
}

Function.Body = function Body({ operation, children }: FunctionBodyProps) {
  return children;
};
