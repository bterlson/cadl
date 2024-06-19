import { strict as assert } from "node:assert";
import { describe, it } from "vitest";
import { render } from "../src/framework/core/render.js";
import { Scope, ScopeContext } from "../src/framework/components/scope.js";
import { useContext } from "../src/framework/core/context.js";
import { EmitOutput } from "../src/framework/components/emit-output.js";

describe("Scope component", () => {
  it("provides scope", () => {
    function Test() {
      const currentScope = useContext(ScopeContext);
      assert(currentScope);
      assert.equal(currentScope.name, "test");
      assert.equal(currentScope.parent!.kind, "global");
    }

    render(<EmitOutput>
      <Scope name="test">
        <Test />
      </Scope>
    </EmitOutput>);
  });

  it("sets nested context", () => {
    function Test() {
      const currentScope = useContext(ScopeContext);
      assert(currentScope);
      assert(currentScope.kind === "local");
      assert(currentScope.parent.kind === "local");
      assert.equal(currentScope.name, "child");
      assert.equal(currentScope.parent.name, "parent");
    }

    render(<EmitOutput>
      <Scope name="parent">
        <Scope name="child">
          <Test />
        </Scope>
      </Scope>
    </EmitOutput>);
  })
})