import * as ay from "@alloy-js/core";
import { Operation } from "@typespec/compiler";
import { $ } from "@typespec/compiler/typekit";
import { Client } from "@typespec/http-client-library";
import { getEnglishTypeName } from "../utils.js";

interface OperationProps {
  client: Client;
  operation: Operation;
}

export function EnglishOperation(props: OperationProps) {
  return (
    <>
      I am operation "{props.operation.name}" of client "{props.client.name}".
      <ay.Indent>
        {ay.mapJoin(
          $.operation.getClientSignature(props.client, props.operation),
          (p) => `${p.name}: ${getEnglishTypeName(p.type)}`,
          {
            joiner: "\n",
          },
        )}
      </ay.Indent>
    </>
  );
}
