import * as ay from "@alloy-js/core";
import { $ } from "@typespec/compiler/typekit";
import { Client } from "@typespec/http-client-library";
import { EnglishOperation } from "./operation.jsx";

interface ClientProps {
  client: Client;
}

export function EnglishClient(props: ClientProps) {
}
