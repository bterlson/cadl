import { code } from "@typespec/efnext/framework";
import { ComponentChildren } from "@typespec/efnext/jsx-runtime";
import {
  FunctionDeclaration,
  InterfaceMember,
  Reference,
  TypeExpression,
} from "@typespec/efnext/typescript";
import { HttpOperation } from "@typespec/http";
import { getHttpParameters } from "../helpers/http-utils.js";
import { coreLib } from "./external-refs.js";

export interface RestResourceProps {
  path: string;
  operations: HttpOperation[];
  children?: ComponentChildren;
}

export function RestResource({ path, operations, children }: RestResourceProps) {
  // Since we get a list of operation grouped by path, we can assume that all operations have the same path parameters
  const pathParameters = getHttpParameters(operations[0], "path");
  return (
    <>
      {code`
      (path: "${path}", ${(<FunctionDeclaration.Parameters parameters={pathParameters} />)}): {
        ${operations.map(({ operation }) => {
          const returnTypeExpression = <TypeExpression type={operation.returnType} />;
          const returnTypes = (
            <FunctionDeclaration.ReturnType>
              {code`
                ${(<Reference builtin={coreLib.httpRuntime.StreamableMethod} />)}<${returnTypeExpression}>
              `}
            </FunctionDeclaration.ReturnType>
          );

          return <InterfaceMember type={operation}>{returnTypes}</InterfaceMember>;
        })}
      };
    `}
      {children}
    </>
  );
}
