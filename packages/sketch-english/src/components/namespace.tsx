import * as ay from "@alloy-js/core";
import { Namespace } from "@typespec/compiler";
import { $ } from "@typespec/compiler/typekit";
import { EnglishClient } from "./client.jsx";
import { EnglishModel } from "./model.jsx";

interface NamespaceProps {
  namespace: Namespace;
}

export function EnglishNamespace(props: NamespaceProps) {
  return (
    <ay.SourceDirectory path={props.namespace.name}>
      {$.clientLibrary.listClients(props.namespace).map((client) => (
        <EnglishClient client={client} />
      ))}
      <ay.SourceFile path="models" filetype="txt">
        {ay.mapJoin(
          $.clientLibrary.listModels(props.namespace),
          (model) => (
            <EnglishModel model={model} />
          ),
          { joiner: "\n" },
        )}
      </ay.SourceFile>
    </ay.SourceDirectory>
  );
}
