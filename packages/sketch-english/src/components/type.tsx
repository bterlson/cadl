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
      return <>Model "{props.type.name}"</>;
    case "Scalar":
      return props.type.name;
    case "String":
      return props.type.value;
    case "Intrinsic":
      return props.type.name;
    default:
      return <>Unknown type {props.type.kind}</>;
  }
}
