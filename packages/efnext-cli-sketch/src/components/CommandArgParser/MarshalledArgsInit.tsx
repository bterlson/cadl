/* eslint-disable unicorn/filename-case */
import { Model, ModelProperty } from "@typespec/compiler";
import { code } from "@typespec/efnext/framework";
import { Value } from "@typespec/efnext/typescript";
import { useCommand } from "./CommandArgParser.js";

export interface MarshalledArgsInit {}

// eslint-disable-next-line no-empty-pattern
export function MarshalledArgsInit({}: MarshalledArgsInit) {
  const { command } = useCommand();
  let defaultArgParams: ModelProperty[];
  if (command.kind === "Interface" || command.kind === "Namespace") {
    // todo: get "command" op for this command group.
    defaultArgParams = [];
  } else {
    defaultArgParams = [...command.parameters.properties.values()];
  }
  const defaultArgs = defaultArgParams.map((p) => buildDefaults(p));

  return code`
    const marshalledArgs: any[] = ${(<Value jsValue={defaultArgs} />)};
  `;
}

function buildDefaults(type: Model | ModelProperty) {
  if (type.kind === "ModelProperty") {
    if (type.defaultValue) {
      switch (type.defaultValue.valueKind) {
        case "BooleanValue":
        case "StringValue":
        case "NullValue":
          return type.defaultValue.value;
        case "NumericValue":
          return type.defaultValue.value.asNumber();
        default:
          throw new Error(
            "default value kind of " + type.defaultValue.valueKind + " not supported"
          );
      }
    } else if (type.type.kind === "Model") {
      return buildDefaults(type.type);
    } else {
      return undefined;
    }
  } else {
    const defaultValue: Record<string, any> = {};
    for (const prop of type.properties.values()) {
      defaultValue[prop.name] = buildDefaults(prop);
    }
    return defaultValue;
  }
}
