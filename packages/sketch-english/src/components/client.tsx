import * as ay from "@alloy-js/core";
import { $ } from "@typespec/compiler/typekit";
import { Client } from "@typespec/http-client-library";

export interface ClientProps {
  client: Client;
}

export function EnglishClient(props: ClientProps) {
  return (
    <ay.SourceFile path={$.client.getName(props.client)} filetype="txt">
      Hello, I am a client called {$.client.getName(props.client)}
    </ay.SourceFile>
  );
}
