import { EmitContext, Interface, Model, ModelProperty, Namespace, Operation, Program, Type, Union, navigateType } from "@typespec/compiler";
import { EmitOutput, SourceFile, code, emit } from "#typespec/emitter/core";
import { HelperContext, getStateHelpers } from "./helpers.js";
import { CommandArgParser } from "./components/CommandArgParser.js";
import { ControllerInterface } from "./components/ControllerInterface.js";
import { HelpText } from "./components/HelpText.js"


export async function $onEmit(context: EmitContext) {
  console.time("emit");
  const helpers = getStateHelpers(context);
  if (context.program.compilerOptions.noEmit) {
    return;
  }

  const clis = helpers.listClis() as (Namespace | Interface | Operation)[];
  const cliSfs = [];

  for (const cli of clis) {
    if (cli.kind === "Operation") {
      const options = collectCommandOptions(cli);
      cliSfs.push(
        <SourceFile path={cli.name + ".ts"} filetype="typescript">
          {code`
            import { parseArgs as nodeParseArgs } from "node:util";
            import Table from "cli-table3";
          `}
          <ControllerInterface command={cli} />
          {code`
            export function parseArgs(args: string[], handler: CommandInterface) {
              parse${cli.name}Args(args);
              ${<CommandArgParser command={cli} options={options}/>}
            }`
          }
        </SourceFile>
      )
    }
  }
  
  
  emit(context,
    <EmitOutput>
      <HelperContext.Provider value={helpers}>
        {cliSfs}
      </HelperContext.Provider>
    </EmitOutput>
  )
  console.timeEnd("emit");
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
