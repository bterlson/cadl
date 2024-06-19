/* eslint-disable unicorn/filename-case */
import { code } from "@typespec/efnext/framework";
import { useCommand } from "./CommandArgParser.js";
import { OptionTokenHandler } from "./OptionTokenHandler.js";
import { PositionalTokenHandler } from "./PositionalTokenHandler.js";

export interface TokenLoopProps {}
// eslint-disable-next-line no-empty-pattern
export function TokenLoop({}: TokenLoopProps) {
  const { command, options } = useCommand();
  const optionTokenHandlers = Array.from(options.entries()).map(([option, path]) => (
    <OptionTokenHandler option={option} path={path} />
  ));

  return code`
    for (const token of tokens) {
      if (token.kind === "positional") {
        ${(<PositionalTokenHandler />)}
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
}
