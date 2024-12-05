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
  $.client.getConstructor(props.client);
  return (
    <>
    Hello, I am operation "{props.operation.name}"!
    <ay.Indent>
      {ay.mapJoin($.operation.getClientSignature(props.client, props.operation), (prop) => {
        return `"${prop.name}" is a "${getEnglishTypeName(prop.type)}"`
      })}
    </ay.Indent>
    </>
  )
}
