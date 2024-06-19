import assert from "node:assert";
import { setTimeout } from "node:timers/promises";
import { describe, it } from "vitest";
import { render } from "../src/framework/core/render.js";
import test from "node:test";

describe("render", () => {
  describe("component return types", () => {
    describe("primitive values", () => {
      it("can return nothing, which is ignored", async () => {
        function Test() {}
        const test = 1;
        const rt = await render(<Test ref={test}/>);
        assert.deepStrictEqual(rt, []);
      });

      it("can return a string", async () => {
        function Test() {
          return "hi";
        }
        const rt = await render(<Test />);
        assert.deepStrictEqual(rt, ["hi"]);
      });

      it("can return a number, which is stringified", async () => {
        function Test() {
          return 1;
        }
        const rt = await render(<Test />);
        assert.deepStrictEqual(rt, ["1"]);
      });

      // NB: I think this should be ignored.
      it("can return false, which is ignored", async () => {
        function Test() {
          return false;
        }
        const rt = await render(<Test />);
        assert.deepStrictEqual(rt, []);
      });

      it("can return true, which is ignored", async () => {
        function Test() {
          return true;
        }
        const rt = await render(<Test />);
        assert.deepStrictEqual(rt, []);
      });
    });
    //describe("array values", () => {});
    describe("components", () => {
      it("can return a single component", async () => {
        function Outer() {
          return <Inner />;
        }

        function Inner() {
          return "hi";
        }

        const rt = await render(<Outer />);
        assert.deepStrictEqual(rt, [["hi"]]);
      });

      it("can return a fragment, which doesn't add a node", async () => {
        function Test() {
          return (
            <>
              <>
                <>
                  <br />
                </>
              </>
            </>
          );
        }

        console.log(await render(<Test />));
      });

      it("can return multiple component in a fragment", async () => {
        function Test() {
          return (
            <>
              <br />
              <br />
            </>
          );
        }

        const rt = await render(<Test />);
        assert.deepStrictEqual(rt, [[["\n"], ["\n"]]]);
      });

      it("await renders non-SourceNode children properly", async () => {
        function Test() {
          return (
            <>
              hello
              <Foo>
                <Bar />
                <Bar />
              </Foo>
            </>
          );
        }

        function Foo({ children }: any) {
          return children;
        }

        function Bar() {
          return "bar";
        }

        const rt = await render(<Test />);
        assert.deepStrictEqual(rt, [["hello", [["bar"], ["bar"]]]]);
      });

      it("await renders SourceNode children properly", async () => {
        function Test() {
          return (
            <>
              hello
              <Foo>
                <Bar />
                <Bar />
              </Foo>
            </>
          );
        }

        function Foo({ children }: any) {
          return (
            <>
              <lb />
              {children}
              <rb />
            </>
          );
        }

        function Bar() {
          return <br />;
        }

        const rt = await render(<Test />);
        console.log(JSON.stringify(rt, null, 4));
      });
    });

    describe("async components", () => {
      it("can handle promises for strings", async () => {
        const p = setTimeout(10, "hi!");
        function Foo() {
          return <>{p} there!</>;
        }

        const rt = await render(<Foo />);
        await p;
        assert.deepStrictEqual(rt, [["hi!", " there!"]]);
      });

      it("works with async function components", async () => {
        const p = setTimeout(10, "hi!");
        async function Foo() {
          await p;
          return <>{p} there!</>;
        }

        const rt = await render(<Foo />);
        await setTimeout(11); // terrible, need a way to await the tree being settled.
        assert.deepStrictEqual(rt, [["hi!", " there!"]]);
      });
    });
  });
});
