import * as ay from "@alloy-js/core";
import { Operation } from "@typespec/compiler";
import { $ } from "@typespec/compiler/typekit";
import { Client } from "@typespec/http-client-library";

interface OperationProps {
  client: Client;
  operation: Operation;
}

export function EnglishOperation(props: OperationProps) {
}
