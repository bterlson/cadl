import { Operation } from "@typespec/compiler";
import { Function } from "#typespec/emitter/typescript";
import { useHelpers } from "../helpers.js";
import { marked } from "marked";
import { markedTerminal } from "marked-terminal";
import pc from "picocolors";
import stripAnsi from 'strip-ansi';
import { code } from "@typespec/compiler/emitter-framework";

function removeHashAndBold(s: string) {
  return pc.bold(s.replace(/^#+ /, ""));
}

marked.use(markedTerminal({
  paragraph: (s: string) => {
    return s.replace(/\n/g, " ");
  },
  firstHeading: removeHashAndBold,
  heading: removeHashAndBold
}) as any);
marked.use({
  breaks: false
})


export interface HelpTextProps {
  command: Operation;
}

export function HelpText({command}: HelpTextProps) {
  const helpers = useHelpers();
  const commandDoc = helpers.getDoc(command);
  const commandDesc = commandDoc ? (marked(commandDoc) as string).replace(/`/g, '\\`') : "";

  return (
    <Function name={`${command.name}Help`} parameters={{"noColor?": "boolean"}}>
      {code`
        if (noColor || process.env["NO_COLOR"]) {
          console.log(\`${command.name} v1.0.0-beta\n\`);
          console.log(\`${stripAnsi(commandDesc)}\`);
        } else {
          console.log(\`${command.name} v1.0.0-beta\n\`);
          console.log(\`${commandDesc}\`);
        }
      `}

    </Function>
  )
}