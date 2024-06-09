import { EmitContext, Model, Namespace, Operation, Program, Type, navigateType } from "@typespec/compiler";
import { EmitOutput, SourceFile, code, emit } from "#typespec/emitter/core";
import { HelperContext, getStateHelpers } from "./helpers.js";
import { CommandArgParser } from "./components/CommandArgParser.js";
import { ControllerInterface } from "./components/ControllerInterface.js";
import { HelpText } from "./components/HelpText.js"
export async function $onEmit(context: EmitContext) {
  if (context.program.compilerOptions.noEmit) {
    return;
  }

  const op = context.program.resolveTypeReference("Foo")![0]! as Operation;
  console.time("emit");
  emit(context,
    <EmitOutput>
      <HelperContext.Provider value={getStateHelpers(context)}>
        <SourceFile path="test.ts" filetype="typescript">
          {code`
            import { parseArgs as nodeParseArgs } from "node:util";
          `}
          <ControllerInterface command={op} />
          {code`
            export function parseArgs(args: string[], handler: CommandInterface) {
              parse${op.name}Args(args);
              ${<CommandArgParser command={op} />}
            }`
          }
          <HelpText command={op} />
        </SourceFile>
      </HelperContext.Provider>
    </EmitOutput>
  )
  console.timeEnd("emit");
}

