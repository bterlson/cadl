import { Function } from "#typespec/emitter/typescript";
import { ModelProperty, Operation } from "@typespec/compiler";
import { code } from "@typespec/compiler/emitter-framework";
import { marked } from "marked";
import { markedTerminal } from "marked-terminal";
import pc from "picocolors";
import stripAnsi from "strip-ansi";
import { useHelpers } from "../helpers.js";

function removeHashAndBold(s: string) {
  return pc.bold(s.replace(/^#+ /, ""));
}

marked.use(
  markedTerminal({
    paragraph: (s: string) => {
      return s.replace(/\n/g, " ");
    },
    firstHeading: removeHashAndBold,
    heading: removeHashAndBold,
  }) as any
);
marked.use({
  breaks: false,
});

export interface HelpTextProps {
  command: Operation;
  options: Map<ModelProperty, string>;
}

export function HelpText({ command, options }: HelpTextProps) {
  const helpers = useHelpers();
  const commandDoc = helpers.getDoc(command);
  const commandDesc = commandDoc
    ? ((marked(commandDoc) as string).trimEnd()+ "\n")
        .replace(/\n/g, "\\n")
        .replace(/"/g, '\\"')
    : "";
  const helpTable = [...options.keys()]
    .sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0))
    .map((o) => pushHelp(o))
    .join("");
  return (
    <Function name={`${command.name}Help`} parameters={{ "noColor?": "boolean" }}>
      {code`
        if (noColor || process.env["NO_COLOR"]) {
          console.log("${command.name} " + handler.version + "\\n");
          console.log("${stripAnsi(commandDesc)}");
        } else {
          console.log("${command.name} ${pc.dim("\" + handler.version + \"")}\\n");
          console.log("${commandDesc}");
        }

        const table = new Table({
          chars: {
            top: "",
            "top-mid": "",
            "top-left": "",
            "top-right": "",
            "mid-mid": "",
            mid: "",
            middle: "",
            bottom: "",
            "bottom-mid": "",
            "bottom-left": "",
            "bottom-right": "",
            left: "",
            "left-mid": "",
            right: "",
            "right-mid": "",
          },
        });
        ${helpTable}
        console.log(\`${pc.bold("Options\n")}\`);
        console.log(table.toString());
      `}
    </Function>
  );

  function pushHelp(option: ModelProperty) {
    let options = `--${option.name}`;

    if (helpers.option.isInvertable(option)) {
      options += `, --no-${option.name}`;
    }

    if (helpers.option.hasShortName(option)) {
      options += `, -${helpers.option.getShortName(option)}`;
    }

    return `table.push([\`${options}\`, \`${pc.dim(helpers.getDoc(option))}\`]);`;
  }
}
