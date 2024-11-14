import { Model } from "@typespec/compiler";

interface ModelProps {
  model: Model;
}

export function EnglishModel(props: ModelProps) {
  return <>Hello, I am model "{props.model.name}"</>;
}
