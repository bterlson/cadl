import { assert, describe, it } from "vitest";
import { Declaration } from "../src/framework/components/declaration.js";
import { EmitOutput } from "../src/framework/components/emit-output.js";
import { SourceDirectory } from "../src/framework/components/source-directory.js";
import { SourceFile } from "../src/framework/components/source-file.js";
import { renderToSourceFiles } from "../src/framework/core/render.js";
import { Reference } from "../src/typescript/reference.js";

describe("Source directory component", () => {
  it("works", async () => {
    let res = await renderToSourceFiles(
      <EmitOutput>
        <SourceDirectory path="src">
          <SourceFile path="test1.ts" filetype="typescript">
            <Declaration name="hi" refkey="hi">
              const hi = 1;
            </Declaration>
          </SourceFile>
          <SourceFile path="test2.ts" filetype="typescript">
            const bye = <Reference refkey="hi" />;
          </SourceFile>
        </SourceDirectory>
      </EmitOutput>
    );

    assert.lengthOf(res, 2);
    assert.include(
      res.map((x) => x.path),
      "src/test1.ts"
    );
    assert.include(
      res.map((x) => x.path),
      "src/test2.ts"
    );
  });

  it("works with no directory", async () => {
    let res = await renderToSourceFiles(
      <EmitOutput>
        <SourceFile path="test1.ts" filetype="typescript">
          <Declaration name="hi" refkey="hi">
            const hi = 1;
          </Declaration>
        </SourceFile>
        <SourceFile path="test2.ts" filetype="typescript">
          const bye = <Reference refkey="hi" />;
        </SourceFile>
      </EmitOutput>
    );

    assert.lengthOf(res, 2);
    assert.include(
      res.map((x) => x.path),
      "test1.ts"
    );
    assert.include(
      res.map((x) => x.path),
      "test2.ts"
    );
  });
});
