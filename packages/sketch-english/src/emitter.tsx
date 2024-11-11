import * as ay from "@alloy-js/core";
import { $ } from "@typespec/compiler/typekit";

import { EmitContext } from "@typespec/compiler";
import { EnglishClient } from "./components/client.jsx";
import { EnglishModel } from "./components/model.jsx";

export async function $onEmit(context: EmitContext) {
  const namespace = $.clientLibrary.listNamespaces()[0];
  return (
    <ay.Output>
      <ay.SourceDirectory path={namespace.name}>
        {$.clientLibrary.listClients(namespace).map((client) => (
          <EnglishClient client={client} />
        ))}
        <ay.SourceFile path="models" filetype="txt">
          {ay.mapJoin(
            $.clientLibrary.listModels(namespace),
            (model) => (
              <EnglishModel model={model} />
            ),
            { joiner: "\n" },
          )}
        </ay.SourceFile>
      </ay.SourceDirectory>
    </ay.Output>
  );
}
