import { format } from "prettier";
import { assert } from "vitest";
import { EmitOutput } from "../src/framework/components/emit-output.js";
import { SourceFile } from "../src/framework/components/source-file.js";
import { render, RenderedTreeNode } from "../src/framework/core/render.js";

async function prepareExpected(expected: string) {
  const expectedRoot = (
    <EmitOutput>
      <SourceFile filetype="typescript" path="test.ts">
        {expected}
      </SourceFile>
    </EmitOutput>
  );

  const rendered = await render(expectedRoot);
  const raw = (rendered as any).flat(Infinity).join("");

  return format(raw, { parser: "typescript" });
}

async function prepareActual(actual: RenderedTreeNode) {
  const raw = (actual as any).flat(Infinity).join("");

  return format(raw, { parser: "typescript" });
}

export async function assertEqual(actual: RenderedTreeNode, expected: string) {
  const actualFormatted = await prepareActual(actual);
  const expectedFormatted = await prepareExpected(expected);

  assert.equal(actualFormatted, expectedFormatted);
}
