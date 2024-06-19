import { strict as assert } from "node:assert";
import { describe, it } from "vitest";
import { render } from "../src/framework/core/render.js";
import { Scope, ScopeContext } from "../src/framework/components/scope.js";
import { useContext } from "../src/framework/core/context.js";
import { EmitOutput } from "../src/framework/components/emit-output.js";
import { SourceFile } from "../src/framework/components/source-file.js";
import { Declaration } from "../src/framework/components/declaration.js";
import { Reference } from "../src/typescript/reference.js";
import { print } from "./utils.js";

describe("Source file component", () => {
  it("works", async () => {
    let res = await render(<EmitOutput>
      <SourceFile path="test1.ts" filetype="typescript">
        <Declaration name="hi" refkey="hi">
          const hi = 1;
        </Declaration>
      </SourceFile>
      <SourceFile path="test2.ts" filetype="typescript">
        const bye = <Reference refkey="hi" />;
      </SourceFile>
    </EmitOutput>);

    await print(res);
  })
})