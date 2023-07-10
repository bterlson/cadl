import * as assert from "assert";
import { createTypeFactory } from "../src/core/type-factory.js";
import { $doc, Program, getDoc } from "../src/index.js";
import { createTestRunner } from "../src/testing/test-host.js";

describe("creating types with the type factory", () => {
  let runner;
  let program: Program;
  let F: ReturnType<typeof createTypeFactory>;
  before(async () => {
    runner = await createTestRunner();
    await runner.compile(``);
    program = runner.program;
    F = createTypeFactory(program);
  });

  it("creates scalars", () => {
    const S1 = F.scalar("S1");
    assert.strictEqual(S1.kind, "Scalar");
    assert.strictEqual(S1.baseScalar, undefined);
    assert.strictEqual(S1.namespace, undefined);

    const S2 = F.scalar([$doc, "doc string"], "S2");
    assert.strictEqual(getDoc(program, S2), "doc string");

    /*
    const S3 = F.scalar([$doc, "doc string"], "S3", {
      extends: S2,
      namespace: F.globalNamespace,
    });
    assert.strictEqual(getDoc(program, S3), "doc string");
    assert.strictEqual(S3.baseScalar, S2);
    assert.strictEqual(S3.namespace, F.globalNamespace);
    */
  });
});
