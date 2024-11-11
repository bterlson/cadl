import * as ay from "@alloy-js/core";
import { $ } from "@typespec/compiler/typekit";

import { EmitContext } from "@typespec/compiler";
import { EnglishClient } from "./components/client.jsx";

export async function $onEmit(context: EmitContext) {
  const namespace = $.clientLibrary.listNamespaces()[0];
  return (
    <ay.Output>
      <ay.SourceDirectory path={namespace.name}>
        {$.clientLibrary.listClients(namespace).map((client) => (
          <EnglishClient client={client} />
        ))}
        <ay.SourceFile path="model.txt" filetype="txt">
          I'm a model
        </ay.SourceFile>
      </ay.SourceDirectory>
    </ay.Output>
  );
}
