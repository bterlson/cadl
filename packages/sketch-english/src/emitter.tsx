import * as ay from "@alloy-js/core";
import { EmitContext } from "@typespec/compiler";
import { $ } from "@typespec/compiler/typekit";
import { EnglishClient } from "./components/client.jsx";
import { EnglishModel } from "./components/model.jsx";

export async function $onEmit(context: EmitContext) {
  const namespace = $.clientLibrary.listNamespaces()[0];
  const clients = $.clientLibrary.listClients(namespace);
  return (
    <ay.SourceDirectory path={namespace.name}>
      {ay.mapJoin(clients, (client) => (
        <EnglishClient client={client} />
      ))}
      <ay.SourceFile path="models" filetype="txt">
        {ay.mapJoin($.clientLibrary.listModels(namespace), (model) => (
          <EnglishModel model={model} />
        ))}
      </ay.SourceFile>
    </ay.SourceDirectory>
  );
}
