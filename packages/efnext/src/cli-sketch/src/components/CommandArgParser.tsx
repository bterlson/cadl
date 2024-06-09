import { code } from "#typespec/emitter/core";
import { $verbatim, Function, ObjectValue, Value } from "#typespec/emitter/typescript";
import { Model, ModelProperty, Operation, Union } from "@typespec/compiler";
import { useHelpers } from "../helpers.js";

export interface CommandArgParserProps {
  command: Operation;
}

export function CommandArgParser({ command }: CommandArgParserProps) {
  const helpers = useHelpers();

  // argument passed to nodeParseArgs
  const parseArgsArg: Record<string, any> = {
    args: $verbatim("args"),
    tokens: true,
    strict: false,
    options: {},
  };

  const optionTokenHandlers = [];
  const options = collectCommandOptions(command);
  // assemble the options in parseArgsArg and arg handlers.
  for (const [option, path] of options) {
    const argOptions: Record<string, any> = {};
    parseArgsArg.options[option.name] = argOptions;

    if (helpers.boolean.is(option.type)) {
      argOptions.type = "boolean";
    } else {
      argOptions.type = "string";
    }

    if (helpers.option.hasShortName(option)) {
      argOptions.short = helpers.option.getShortName(option);
    }

    optionTokenHandlers.push(<OptionTokenHandler option={option} path={path} />);
  }

  const defaultArgs = [...command.parameters.properties.values()].map((p) => buildDefaults(p));
  const body = code`
    const { tokens } = nodeParseArgs(${(<ObjectValue jsValue={parseArgsArg} />)});
    const marshalledArgs: any[] = ${(<Value jsValue={defaultArgs} />)};
    for (const token of tokens) {
      if (token.kind === "positional") {
        ${(<HandlePositionalToken hasPositionals={false} />)}
      } else if (token.kind === "option") {
        switch (token.name) {
          case "h":
          case "help":
            ${command.name}Help();
            return;
          ${optionTokenHandlers}
        }
      }
    }
    (handler.${command.name} as any)(... marshalledArgs);
  `;
  return (
    <Function name={`parse${command.name}Args`} parameters={{ args: "string[]" }}>
      {body}
    </Function>
  );
}

interface HandlePositionalTokenProps {
  hasPositionals: boolean;
}

function HandlePositionalToken({ hasPositionals }: HandlePositionalTokenProps) {
  if (hasPositionals) {
    return `throw new Error("NYI")`;
  } else {
    return code`
        throw new Error("Unknown positional argument");
    `;
  }
}

interface OptionTokenHandlerProps {
  option: ModelProperty;
  path: string;
}

function OptionTokenHandler({ option, path }: OptionTokenHandlerProps) {
  const helpers = useHelpers();
  let handler;

  if (helpers.boolean.is(option.type)) {
    const cases = [cse(`marshalledArgs${path} = true`)];
    if (helpers.option.isInvertable(option)) {
      cases.push(cse(`marshalledArgs${path} = false`, "no-" + option.name));
    }

    return cases;
  } else {
    // todo: marshalling etc.
    return cse(`marshalledArgs${path} = token.value!`);
  }

  function cse(handler: string, optionName?: string) {
    const names = optionName
      ? [optionName]
      : helpers.option.hasShortName(option)
        ? [helpers.option.getShortName(option), option.name]
        : [option.name];

    return code`
      ${names.map(v => `case "${v}": `).join("")}${handler}; break;
    `;
  }
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
function collectCommandOptions(command: Operation): Map<ModelProperty, string> {
  const commandOpts = new Map<ModelProperty, string>();

  const types: [Model | Union, string, boolean?][] = [[command.parameters, "", true]];

  while (types.length > 0) {
    const [type, path, topLevel] = types.pop()!;

    if (type.kind === "Model") {
      let index = 0;
      for (const param of type.properties.values()) {
        const paramPath = topLevel ? `[${index}]` : `${path}.${param.name}`;
        if (param.type.kind === "Model") {
          types.push([param.type, paramPath]);
        } else if (
          param.type.kind === "Union" &&
          [...param.type.variants.values()].find((v) => v.type.kind === "Model")
        ) {
        } else {
          commandOpts.set(param, paramPath);
        }

        index++;
      }
    } else if (type.kind === "Union") {
      for (const variant of type.variants.values()) {
        if (variant.type.kind === "Union" || variant.type.kind === "Model") {
          types.push([variant.type, path]);
        }
      }
    }
  }

  return commandOpts;
}
