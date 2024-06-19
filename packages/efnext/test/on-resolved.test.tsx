import { describe, it } from "vitest";
import { render } from "../src/framework/core/render.js";
import { useResolved } from "../src/framework/core/use-resolved.js";
import assert from "node:assert/strict"

describe("useResolved", () => {
  it("works", async () => {
    function Test() {
      const OnResolved = useResolved(() => <>
        hi
      </>);
      return <OnResolved />
    }

    const res = await render(<Test />);
    assert.deepEqual(res, [[["hi"]]]);
  });
});