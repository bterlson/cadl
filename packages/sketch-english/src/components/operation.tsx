import * as ay from "@alloy-js/core";
import { Operation } from "@typespec/compiler";
import { $ } from "@typespec/compiler/typekit";
import { Client } from "@typespec/http-client-library";
import { EnglishType } from "./type.jsx";

export interface OperationProps {
  client: Client;
  operation: Operation;
}

export function EnglishOperation(props: OperationProps) {
  return (
    <>
      Operation "{props.operation.name}"
      <ay.Indent>
        {ay.mapJoin(
          $.operation.getClientSignature(props.client, props.operation),
          (prop) => (
            <>
              Input "{prop.name}" with type "<EnglishType type={prop.type} />"
            </>
          ),
          { joiner: "\n" },
        )}
      </ay.Indent>
      <ay.Indent>
        Return type "<EnglishType type={$.operation.getValidReturnType(props.operation)} />"
      </ay.Indent>
    </>
  );
}
