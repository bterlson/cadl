import { CliType } from "#typespec-cli";
import { code } from "#typespec/emitter/core";
import { Function, ObjectValue, Value } from "#typespec/emitter/typescript";
import { Interface, Model, ModelProperty, Namespace, Operation } from "@typespec/compiler";
import { useHelpers } from "../../helpers.js";
import { HelpText } from "../HelpText.js";
import { GetTokens } from "./GetTokens.js";
import { MarshalledArgsInit } from "./MarshalledArgsInit.js";
import { PositionalTokenHandler } from "./PositionalTokenHandler.js";
import { OptionTokenHandler } from "./OptionTokenHandler.js";

export interface CommandArgParserProps {
  command: Operation | Namespace | Interface;
  options: Map<ModelProperty, string>;
}

export function CommandArgParser({ command, options }: CommandArgParserProps) {
  const hasSubcommands = command.kind === "Namespace" || command.kind === "Interface";
  const subcommands = hasSubcommands
    ? [...(command as Namespace | Interface).operations.values()]
    : [];
  
  // map of subcommand name to the operation for that subcommand
  const subcommandMap = new Map<string, Operation>();
  for (const subcommand of subcommands) {
    subcommandMap.set(subcommand.name, subcommand);
  }

  const optionTokenHandlers = Array.from(options.entries()).map(([option, path]) => (
    <OptionTokenHandler option={option} path={path} />
  ));

  return (
    <>
      <Function name={`parse${command.name}Args`} parameters={{ args: "string[]" }}>
        <GetTokens options={options} />
        <MarshalledArgsInit command={command}/>
        {code`
          for (const token of tokens) {
            if (token.kind === "positional") {
              ${(<PositionalTokenHandler hasPositionals={false} subcommands={subcommandMap} />)}
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
        `}
      </Function>
      <HelpText command={command} options={options} subcommands={subcommandMap} />
    </>
  );
}


