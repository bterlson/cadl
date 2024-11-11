import * as ay from "@alloy-js/core";
import { Client } from "@typespec/http-client-library";
import { ClientComponent, useClientContext } from "../utils/contexts/client-context.jsx";
import { EnglishOperation } from "./operation.js";

export interface ClientProps {
  client: Client;
}

export function EnglishClient(props: ClientProps) {
  return (
    <ClientComponent client={props.client}>
      <EnglishClientInternal client={props.client} />
    </ClientComponent>
  );
}

function EnglishClientInternal(props: ClientProps) {
  const client = useClientContext();
  return (
    <ay.SourceFile path={client.getName()} filetype="txt">
      Client "{client.getName()}"
      <ay.Indent>
        <EnglishOperation operation={client.getConstructor()} />
      </ay.Indent>
      <ay.Indent>
        {ay.mapJoin(
          client.listServiceOperations(),
          (operation) => (
            <EnglishOperation operation={operation} />
          ),
          { joiner: "\n" },
        )}
      </ay.Indent>
    </ay.SourceFile>
  );
}
