import * as ay from "@alloy-js/core";
import { EmitContext } from "@typespec/compiler";
import { $ } from "@typespec/compiler/typekit";
import { EnglishNamespace } from "./components/namespace.jsx";

export async function $onEmit(context: EmitContext) {
  $.clientLibrary.listNamespaces();
  return (
    <ay.Output>
      {ay.mapJoin($.clientLibrary.listNamespaces(), (namespace) => (
        <EnglishNamespace namespace={namespace} />
      ))}
    </ay.Output>
  );
}
