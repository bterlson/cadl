import { describe, it } from "vitest";
import { render, print } from "../src/framework/core/render.js";
import { Indent } from "../src/framework/components/indent.js";
import assert from "node:assert/strict";

describe("<Indent>", () => {
  it("indents appropriately", async () => {
    const tree = await render(
      <Indent>
        @dataclass<br/>
        class Address:<br/>
        <Indent>
          street: str<br/>
          city: str<br/>
          postal_code: str<br/>
        </Indent>
      </Indent>
    )

    let str = await print(tree);
    assert.equal(str,
`  @dataclass
  class Address:
    street: str
    city: str
    postal_code: str
`
    )
  })
})