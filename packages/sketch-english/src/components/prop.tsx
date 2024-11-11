import { ModelProperty } from "@typespec/compiler";
import { getEnglishTypeName } from "../utils/utils.js";

export interface ModelPropertyProps {
  prop: ModelProperty;
}

export function EnglishProp(props: ModelPropertyProps) {
  return (
    <>
      "{props.prop.name}" with type "{getEnglishTypeName(props.prop.type)}"
    </>
  );
}
