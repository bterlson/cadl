import * as ay from "@alloy-js/core";
import { Model } from "@typespec/compiler";
import { $ } from "@typespec/compiler/typekit";
import { EnglishProp } from "./model-property.jsx";

interface ModelProps {
  model: Model;
}

export function EnglishModel(props: ModelProps) {
  return (
    <>
      Hello, I am model "{props.model.name}"!
      <ay.Indent>
        {ay.mapJoin($.model.listProperties(props.model), (property) => (
          <EnglishProp modelProperty={property} />
        ))}
      </ay.Indent>
    </>
  );
}
