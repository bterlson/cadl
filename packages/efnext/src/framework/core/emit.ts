import { SourceNode } from "#jsx/jsx-runtime";
import { EmitContext, emitFile, joinPaths } from "@typespec/compiler";
import { renderToSourceFiles } from "./render.js";

// todo: this should be handled when returning components from OnEmit
export async function emit(context: EmitContext, node: SourceNode) {
  const rendered = await renderToSourceFiles(node, { format: false });
  for (const file of rendered) {
    file.path = joinPaths(context.emitterOutputDir, file.path);
    await emitFile(context.program, file);
  }
}
