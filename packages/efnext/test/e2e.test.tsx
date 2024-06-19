import { describe, it } from "vitest";
import { EmitOutput } from "../src/framework/components/emit-output.js";
import { SourceFile } from "../src/framework/components/source-file.js";
import {
  SourceFileRecord as SF,
  render,
  renderToSourceFiles,
} from "../src/framework/core/render.js";
import { Reference } from "../src/typescript/reference.js";
import { TypeDeclaration } from "../src/typescript/type-declaration.js";
import { getProgram } from "./test-host.js";
import { print } from "./utils.js";

function printSourceFiles(files: SF[]) {
  for (const file of files) {
    console.log("## " + file.path);
    console.log((file.content += "\n"));
  }
}

describe("e2e", () => {
  it("example", async () => {
    const program = await getProgram(`
      model Foo { x: true | string }
      model Bar { x: Foo, y: { a: 1 } }
    `);

    const [Foo] = program.resolveTypeReference("Foo");
    const [Bar] = program.resolveTypeReference("Bar");

    let res = await renderToSourceFiles(
      <EmitOutput>
        <SourceFile path="test.ts" filetype="typescript">
          <TypeDeclaration type={Foo!} />
        </SourceFile>
        <SourceFile path="test2.ts" filetype="typescript">
          <TypeDeclaration type={Bar!} />
        </SourceFile>
        <SourceFile path="test3.ts" filetype="typescript">
          const x = <Reference refkey={Bar!} />;
        </SourceFile>
      </EmitOutput>
    );

    printSourceFiles(res);
  });

  it("interfaces", async () => {
    const program = await getProgram(`
      model Foo { x: true }
      model Bar { x: Foo, y: { a: 1 } }
    `);

    const [Foo] = program.resolveTypeReference("Foo");
    const [Bar] = program.resolveTypeReference("Bar");

    let res = await render(
      <EmitOutput>
        <SourceFile path="test.ts" filetype="typescript">
          <TypeDeclaration type={Foo!} />
          <TypeDeclaration type={Bar!} />
        </SourceFile>
      </EmitOutput>
    );

    await print(res);
  });
  it("interfaces in reverse order", async () => {
    const program = await getProgram(`
      model Foo { x: true }
      model Bar { x: Foo, y: { a: 1 } }
    `);

    const [Foo] = program.resolveTypeReference("Foo");
    const [Bar] = program.resolveTypeReference("Bar");

    let res = await render(
      <EmitOutput>
        <SourceFile path="test.ts" filetype="typescript">
          <TypeDeclaration type={Bar!} />
          <TypeDeclaration type={Foo!} />
        </SourceFile>
      </EmitOutput>
    );

    await print(res);
  });

  it("works with circular references", async () => {
    const program = await getProgram(`
      model Foo { x: Bar }
      model Bar { x: Foo }
    `);

    const [Foo] = program.resolveTypeReference("Foo");
    const [Bar] = program.resolveTypeReference("Bar");

    let res = await render(
      <EmitOutput>
        <SourceFile path="test.ts" filetype="typescript">
          <TypeDeclaration type={Bar!} />
          <TypeDeclaration type={Foo!} />
        </SourceFile>
      </EmitOutput>
    );

    await print(res);
  });

  it("works with cross-source-file references", async () => {
    const program = await getProgram(`
    model Foo { x: Bar }
    model Bar { x: Foo }
  `);

    const [Foo] = program.resolveTypeReference("Foo");
    const [Bar] = program.resolveTypeReference("Bar");

    let res = await render(
      <EmitOutput>
        <SourceFile path="test1.ts" filetype="typescript">
          <TypeDeclaration type={Bar!} />
        </SourceFile>
        <SourceFile path="test2.ts" filetype="typescript">
          <TypeDeclaration type={Foo!} />
        </SourceFile>
      </EmitOutput>
    );

    await print(res);
  });
});
