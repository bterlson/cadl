import * as ay from "@alloy-js/core";
import { $ } from "@typespec/compiler/typekit";
import { Client } from "@typespec/http-client-library";
import { EnglishOperation } from "./operation.jsx";

interface ClientProps {
  client: Client;
}

export function EnglishClient(props: ClientProps) {
  const constructor = $.client.getConstructor(props.client);
  return (
    <ay.SourceFile path={props.client.name} filetype="txt">
      Hello, I am client "{props.client.name}"!
      <ay.Indent>
        <EnglishOperation client={props.client} operation={constructor} />
        {ay.mapJoin($.client.listServiceOperations(props.client), (op) => (
          <EnglishOperation client={props.client} operation={op}/>
        ))}
      </ay.Indent>
    </ay.SourceFile>
  )
}
