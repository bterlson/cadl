import { ModelProperty } from "@typespec/compiler";
import { getEnglishTypeName } from "../utils.js";

interface ModelPropertyProps {
  modelProperty: ModelProperty;
}

export function EnglishProp(props: ModelPropertyProps) {
  return (
    <>
      Hello I am property "{props.modelProperty.name}" and I have type {getEnglishTypeName(props.modelProperty.type)}
    </>
  );
}
