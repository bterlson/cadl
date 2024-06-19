import { describe, it } from "vitest";
import { emit } from "./test-host.js";

describe.skip("hello", () => {
  it("emit output.txt with content hello world", async () => {
    const results = await emit(`op test(colors: boolean): void;`);
    console.log(results);
  });
});
