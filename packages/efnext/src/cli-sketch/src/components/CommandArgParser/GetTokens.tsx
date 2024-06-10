import { $verbatim, ObjectValue } from "#typespec/emitter/typescript";
import { ModelProperty } from "@typespec/compiler";
import { useHelpers } from "../../helpers.js";
import { code } from "#typespec/emitter/core";

export interface GetTokensProps {
  options: Map<ModelProperty, string>;
}

export function GetTokens({options}: GetTokensProps) {
  const helpers = useHelpers();
  
  const parseArgsArg: Record<string, any> = {
    args: $verbatim("args"),
    tokens: true,
    strict: false,
    options: {},
  };

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
  }

  return code`
    const { tokens } = nodeParseArgs(${(<ObjectValue jsValue={parseArgsArg} />)});
  `
}