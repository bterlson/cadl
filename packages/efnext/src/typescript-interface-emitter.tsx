import { EmitContext, Program } from "@typespec/compiler";
import { dirname, join } from "path";
import { format } from "prettier";
import { EmitOutput, SourceFile } from "../src/framework/components/index.js";
import { EnumDeclaration } from "../src/typescript/enum-declaration.js";
import { FunctionDeclaration } from "../src/typescript/function-declaration.js";
import { InterfaceDeclaration } from "../src/typescript/interface-declaration.js";
import { ScalarDeclaration } from "../src/typescript/scalar-declaration.js";
import { UnionDeclaration } from "../src/typescript/union-declaration.js";
import { SourceDirectory } from "./framework/components/source-directory.js";
import { renderToSourceFiles } from "./framework/core/render.js";

export async function $onEmit(context: EmitContext) {
  const rendered = await renderToSourceFiles(emitTypescriptInterfaces(context.program));
  for (const file of rendered) {
    const path = join(context.emitterOutputDir, file.path);
    await context.program.host.mkdirp(dirname(path));
    const output = await format(file.content, { parser: "typescript" });
    await context.program.host.writeFile(path, output);
  }
}

export function emitTypescriptInterfaces(program: Program) {
  const globalNamespace = program.getGlobalNamespaceType();

  const namespaces = [...globalNamespace.namespaces.values()].filter(
    (ns) => ns.name !== "TypeSpec"
  );

  namespaces.unshift(globalNamespace);

  return (
    <EmitOutput>
      {namespaces.map((namespace) => {
        const models = [...namespace.models.values()];
        const operations = [...namespace.operations.values()];
        const enums = [...namespace.enums.values()];
        const unions = [...namespace.unions.values()];
        const interfaces = [...namespace.interfaces.values()];
        const scalars = [...namespace.scalars.values()];

        const file = (
          <SourceFile path="index.ts" filetype="typescript">
            {models.map((model) => (
              <InterfaceDeclaration type={model} />
            ))}
            {operations.map((operation) => (
              <FunctionDeclaration type={operation} />
            ))}
            {enums.map((enumType) => (
              <EnumDeclaration type={enumType} />
            ))}
            {unions.map((union) => (
              <UnionDeclaration type={union}></UnionDeclaration>
            ))}
            {interfaces.map((iface) => (
              <InterfaceDeclaration type={iface} />
            ))}
            {scalars.map((scalar) => (
              <ScalarDeclaration type={scalar} />
            ))}
          </SourceFile>
        );

        if (namespace.name) {
          return <SourceDirectory path={namespace.name}>{file}</SourceDirectory>;
        }

        return file;
      })}
    </EmitOutput>
  );
}
