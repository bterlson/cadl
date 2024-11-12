import * as ay from "@alloy-js/core";
import { Operation } from "@typespec/compiler";
import { $ } from "@typespec/compiler/typekit";
import { Client } from "@typespec/http-client-library";
import { EnglishProp } from "./model-property.jsx";
import { getEnglishTypeName } from "../utils.js";

interface OperationProps {
  client: Client;
  operation: Operation;
}

export function EnglishOperation(props: OperationProps) {
  return (
    <ay.SourceFile path={props.operation.name} filetype="txt">
      Hello, I am operation "{props.operation.name}"!
      <ay.Indent>
        {ay.mapJoin($.operation.getClientSignature(props.client, props.operation), (p) => (
          <EnglishProp modelProperty={p} />
        ))}
        I have return type {getEnglishTypeName($.operation.getValidReturnType(props.operation))}
      </ay.Indent>
    </ay.SourceFile>
  );
}
