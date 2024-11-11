import * as ay from "@alloy-js/core";
import { $ } from "@typespec/compiler/typekit";

import { EmitContext } from "@typespec/compiler";
import { EnglishNamespace } from "./components/namespace.jsx";

export async function $onEmit(context: EmitContext) {
  return (
    <ay.Output>
      {ay.mapJoin($.clientLibrary.listNamespaces(), (namespace) => (
        <EnglishNamespace namespace={namespace} />
      ))}
    </ay.Output>
  );
}
