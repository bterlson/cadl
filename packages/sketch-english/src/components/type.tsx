import { Type } from "@typespec/compiler";

export interface TypeProps {
  type: Type | undefined;
}

export function EnglishType(props: TypeProps) {
  if (props.type === undefined) {
    return <>undefined</>;
  }
  switch (props.type.kind) {
    case "Model":
    case "Scalar":
    case "Intrinsic":
      return props.type.name;
    case "String":
      return props.type.value;
    default:
      return <>Unknown type {props.type.kind}</>;
  }
}
