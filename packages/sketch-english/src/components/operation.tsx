import * as ay from "@alloy-js/core";
import { Operation } from "@typespec/compiler";
import { $ } from "@typespec/compiler/typekit";
import { Client } from "@typespec/http-client-library";
import { getEnglishTypeName } from "../utils/utils.js";
import { EnglishProp } from "./prop.js";

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
            <EnglishProp prop={prop} />
          ),
          { joiner: "\n" },
        )}
      </ay.Indent>
      <ay.Indent>
        Return type "{getEnglishTypeName($.operation.getValidReturnType(props.operation))}"
      </ay.Indent>
    </>
  );
}
