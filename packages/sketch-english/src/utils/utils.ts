import { Type } from "@typespec/compiler";

export function getEnglishTypeName(type: Type | undefined): string {
  if (type === undefined) {
    return "undefined";
  }
  switch (type.kind) {
    case "Model":
    case "Scalar":
    case "Intrinsic":
      return type.name;
    case "String":
      return type.value;
    default:
      return "unknown";
  }
}
