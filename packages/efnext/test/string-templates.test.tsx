import { describe, it } from "vitest";
import { render, print } from "../src/framework/core/render.js";
import { Indent } from "../src/framework/components/indent.js";
import assert from "node:assert/strict";
import { code } from "../src/framework/core/code.js";

describe("code template", () => {
  it("works", async () => {
    function PythonDataClass() {
      return code`
        @dataclass
        class Foo:
          ${<StandardMembers />}
          isFoo: bool
        
        @dataclass
        class Bar:
          ${<StandardMembers />}
          isBar: bool
      `
    }

    function StandardMembers() {
      return code`
        ${<DataClassMember name="foo" type="str" />}
        ${<DataClassMember name="bar" type="int" />}
      `
    }
    function DataClassMember({ name, type }: { name: string, type: string }) {
      return <>{name}: {type}</>;
    }


    const tree = await render(<PythonDataClass />);
    const output = await print(tree);
    console.log(output);
    //assert.equal(output, "A\nB\nC");
  });
});