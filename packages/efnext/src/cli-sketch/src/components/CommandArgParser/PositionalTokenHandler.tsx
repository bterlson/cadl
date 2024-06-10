import { CliType } from "#typespec-cli";
import { code } from "#typespec/emitter/core";

export interface PositionalTokenHandlerProps {
  hasPositionals: boolean;
  subcommands?: Map<string, CliType>;
}

export function PositionalTokenHandler({ hasPositionals, subcommands }: PositionalTokenHandlerProps) {
  if (hasPositionals) {
    return `throw new Error("NYI")`;
  } else if (subcommands && subcommands.size > 0) {
    const subcommandCases = [...subcommands.entries()].map(([name, cli]) => {
      return code`
        case "${name}": parse${name}Args(args.slice(token.index + 1)); return;
      `;
    });
    // TODO: Fix this any cast
    return code`
      switch (token.value) {
        ${subcommandCases as any} 
      }
    `;
  } else {
    return code`
        throw new Error("Unknown positional argument");
    `;
  }
}