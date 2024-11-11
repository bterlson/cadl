import * as ay from "@alloy-js/core";
import { Model } from "@typespec/compiler";
import { $ } from "@typespec/compiler/typekit";
import { EnglishProp } from "./prop.jsx";

export interface ModelProps {
  model: Model;
}

export function EnglishModel(props: ModelProps) {
  return (
    <>
      Model "{props.model.name}"
      <ay.Indent>
        {ay.mapJoin(
          $.model.listProperties(props.model),
          (prop) => (
            <EnglishProp prop={prop} />
          ),
          { joiner: "\n" },
        )}
      </ay.Indent>
    </>
  );
}
