import * as ay from "@alloy-js/core";
import { EmitContext } from "@typespec/compiler";
import { $ } from "@typespec/compiler/typekit";
import { EnglishClient } from "./components/client.jsx";

export async function $onEmit(context: EmitContext) {
  const namespace = $.clientLibrary.listNamespaces()[0];
  const clients = $.clientLibrary.listClients(namespace);
  return (
    <ay.SourceDirectory path={namespace.name}>
      {ay.mapJoin(clients, (client) => (
        <EnglishClient client={client} />
      ))}
    </ay.SourceDirectory>
  )
}
