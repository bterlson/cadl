import { CliType } from "#typespec-cli";
import { createContext, useContext } from "#typespec/emitter/core";
import { Function } from "#typespec/emitter/typescript";
import { Interface, ModelProperty, Namespace, Operation } from "@typespec/compiler";
import { HelpText } from "../HelpText.js";
import { GetTokens } from "./GetTokens.js";
import { MarshalledArgsInit } from "./MarshalledArgsInit.js";
import { TokenLoop } from "./TokenLoop.js";

interface CommandContext {
  command: CliType;
  options: Map<ModelProperty, string>;
  subcommandMap: Map<string, Operation>;
}

const CommandContext = createContext<CommandContext>();

export function useCommand() {
  return useContext(CommandContext)!;
}

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

  return (
    <CommandContext.Provider value={{ command, options, subcommandMap }}>
      <Function name={`parse${command.name}Args`} parameters={{ args: "string[]" }}>
        <GetTokens />
        <MarshalledArgsInit />
        <TokenLoop />
      </Function>
      <HelpText />
    </CommandContext.Provider>
  );
}
