import { isTemplateInstance } from "@typespec/compiler";
import { pascalCase, snakeCase } from "change-case";
import { createNamePolicy } from "../framework/core/name-policy.js";
import { isDeclaration } from "../framework/utils/typeguards.js";

// todo: provide in Python framework

type NameKinds = "classMember" | "class" | "function" | "parameter" | "enumMember";

export const pythonNamePolicy = createNamePolicy<NameKinds>((type, kind) => {
  if (!("name" in type && typeof type.name === "string")) {
    return "unknown name";
  }

  let name;
  if (isTemplateInstance(type) && isDeclaration(type)) {
    let unspeakable = false;

    const parameterNames = type.templateMapper.args.map((t) => {
      if (t.entityKind === "Indeterminate") {
        t = t.type;
      }
      if (!("kind" in t)) {
        return undefined;
      }
      switch (t.kind) {
        case "Model":
        case "Scalar":
        case "Interface":
        case "Operation":
        case "Enum":
        case "Union":
        case "Intrinsic":
          if (!t.name) {
            unspeakable = true;
            return undefined;
          }
          const declName: string = pythonNamePolicy.renamer.getName(t, "class");
          if (declName === undefined) {
            unspeakable = true;
            return undefined;
          }
          return declName[0].toUpperCase() + declName.slice(1);
        default:
          unspeakable = true;
          return undefined;
      }
    });

    if (unspeakable) {
      return "Unspeakable";
    }

    name = type.name + parameterNames.join("");
  } else {
    name = type.name;
  }

  switch (kind) {
    case "class":
      return pascalCase(name);
    case "classMember":
    case "function":
    case "parameter":
    case "enumMember":
      return snakeCase(name);
    default:
      throw new Error(`Unknown kind ${kind}`);
  }
});
