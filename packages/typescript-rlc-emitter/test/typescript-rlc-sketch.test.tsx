import { EmitContext } from "@typespec/compiler";
import { renderToSourceFiles } from "@typespec/efnext/framework";
import { format } from "prettier";
import { assert, describe, it } from "vitest";
import { emitRlc } from "../src/index.js";
import { getProgram } from "./test-host.js";

describe.skip("e2e typescript rlc emitter", () => {
  describe("Rest Operations", () => {
    it("should render rlc structure!", async () => {
      const program = await getProgram(
        `
            import "@typespec/http";
  
            using TypeSpec.Http;
            @service({
              title: "Widget Service",
            })
            namespace DemoService;
  
            @route("/widgets")
            @tag("Widgets")
            interface Widgets {
              @get list(): string[];
            }
          `,
        { libraries: ["Http"] }
      );

      const emitContext: EmitContext = {
        program,
      } as EmitContext;

      const tree = emitRlc(emitContext);
      const files = await renderToSourceFiles(tree);

      const formattedActual = await format(files[1].content, { parser: "typescript" });
      const formattedExpected = await format(
        `
        import { DemoServiceWidgetsList200Response } from "./models.js";
  
        export interface Client {
          (path: "/widgets"): {
            get(options?: {}): DemoServiceWidgetsget200Response;
          };
        }`,
        { parser: "typescript" }
      );

      assert.equal(formattedActual, formattedExpected);
    });

    it("should render path parameters", async () => {
      const program = await getProgram(
        `
            import "@typespec/http";
  
            using TypeSpec.Http;
            @service({
              title: "Widget Service",
            })
            namespace DemoService;
  
            @route("/widgets/{id}")
            @tag("Widgets")
            interface Widgets {
              @get list(@path id: string): string[];
            }
          `,
        { libraries: ["Http"] }
      );

      const emitContext: EmitContext = {
        program,
      } as EmitContext;

      const tree = emitRlc(emitContext);
      const result = await renderToSourceFiles(tree);

      const formattedActual = await format(result[1].content, { parser: "typescript" });
      const formattedExpected = await format(
        `
        import { DemoServiceWidgetsget200Response } from "./models.js";
  
         export interface Client {
           (path: "/widgets/{id}", id: string): {
             get(options?: {}): DemoServiceWidgetsget200Response;
           };
        }`,
        { parser: "typescript" }
      );

      assert.equal(formattedActual, formattedExpected);
    });

    it("should render body parameters", async () => {
      const program = await getProgram(
        `
            import "@typespec/http";
  
            using TypeSpec.Http;
            @service({
              title: "Widget Service",
            })
            namespace DemoService;
  
            model Widget {
              name: string;
            }
  
            @route("/widgets")
            @tag("Widgets")
            interface Widgets {
              @get list(...Widget): string[];
            }
          `,
        { libraries: ["Http"] }
      );

      const emitContext: EmitContext = {
        program,
      } as EmitContext;

      const tree = emitRlc(emitContext);

      const result = await renderToSourceFiles(tree);

      const formattedActual = await format(result[1].content, { parser: "typescript" });
      const formattedExpected = await format(
        `
        import { DemoServiceWidgetsget200Response } from "./models.js";
  
          export interface Client {
          (path: "/widgets"): {
            get(options: {body: {name: string}}): DemoServiceWidgetsget200Response;
          };
        }`,
        { parser: "typescript" }
      );

      assert.equal(formattedActual, formattedExpected);
    });

    it("should render body parameter as optional", async () => {
      const program = await getProgram(
        `
            import "@typespec/http";
  
            using TypeSpec.Http;
            @service({
              title: "Widget Service",
            })
            namespace DemoService;
  
            model Widget {
              name?: string;
            }
  
            @route("/widgets")
            @tag("Widgets")
            interface Widgets {
              @get list(...Widget): string[];
            }
          `,
        { libraries: ["Http"] }
      );

      const emitContext: EmitContext = {
        program,
      } as EmitContext;

      const tree = emitRlc(emitContext);
      const result = await renderToSourceFiles(tree);

      const formattedActual = await format(result[1].content, { parser: "typescript" });
      const formattedExpected = await format(
        `
        import { DemoServiceWidgetsget200Response } from "./models.js";
  
         export interface Client {
          (path: "/widgets"): {
            get(options?: {body?: {name?: string}}): DemoServiceWidgetsget200Response;
          };
        }`,
        { parser: "typescript" }
      );

      assert.equal(formattedActual, formattedExpected);
    });

    it("should render query parameters", async () => {
      const program = await getProgram(
        `
            import "@typespec/http";
  
            using TypeSpec.Http;
            @service({
              title: "Widget Service",
            })
            namespace DemoService;
  
            model Widget {
              name: string;
            }
  
            @route("/widgets")
            @tag("Widgets")
            interface Widgets {
              @get list(...Widget, @query requestId: string): string[];
            }
          `,
        { libraries: ["Http"] }
      );

      const emitContext: EmitContext = {
        program,
      } as EmitContext;

      const tree = emitRlc(emitContext);
      const result = await renderToSourceFiles(tree);

      const formattedActual = await format(result[1].content, { parser: "typescript" });
      const formattedExpected = await format(
        `
        import { DemoServiceWidgetsget200Response } from "./models.js";
  
         export interface Client {
          (path: "/widgets"): {
            get(options: {
              body: {name: string}, 
              query: {requestId: string}
            }): DemoServiceWidgetsget200Response;
          };
        }`,
        { parser: "typescript" }
      );

      assert.equal(formattedActual, formattedExpected);
    });

    it("should render header parameters", async () => {
      const program = await getProgram(
        `
            import "@typespec/http";
  
            using TypeSpec.Http;
            @service({
              title: "Widget Service",
            })
            namespace DemoService;
  
            model Widget {
              name: string;
            }
  
            @route("/widgets")
            @tag("Widgets")
            interface Widgets {
              @get list(...Widget, @header requestId?: string): string[];
            }
          `,
        { libraries: ["Http"] }
      );

      const emitContext: EmitContext = {
        program,
      } as EmitContext;

      const tree = emitRlc(emitContext);
      const result = await renderToSourceFiles(tree);

      const formattedActual = await format(result[1].content, { parser: "typescript" });
      const formattedExpected = await format(
        `
        import { DemoServiceWidgetsget200Response } from "./models.js";
  
         export interface Client {
          (path: "/widgets"): {
            get(options: {
              body: {name: string}, 
              headers?: {requestId?: string}
            }): DemoServiceWidgetsget200Response;
          };
        }`,
        { parser: "typescript" }
      );

      assert.equal(formattedActual, formattedExpected);
    });

    it("options should be optional when no required parameters", async () => {
      const program = await getProgram(
        `
            import "@typespec/http";
  
            using TypeSpec.Http;
            @service({
              title: "Widget Service",
            })
            namespace DemoService;
  
            model Widget {
              name?: string;
            }
  
            @route("/widgets")
            @tag("Widgets")
            interface Widgets {
              @get list(...Widget, @header requestId?: string): string[];
            }
          `,
        { libraries: ["Http"] }
      );

      const emitContext: EmitContext = {
        program,
      } as EmitContext;

      const tree = emitRlc(emitContext);
      const result = await renderToSourceFiles(tree);

      const formattedActual = await format(result[1].content, { parser: "typescript" });
      const formattedExpected = await format(
        `
        import { DemoServiceWidgetsget200Response } from "./models.js";
  
         export interface Client {
          (path: "/widgets"): {
            get(options?: {
              body?: {name?: string}, 
              headers?: {requestId?: string}
            }): DemoServiceWidgetsget200Response;
          };
        }`,
        { parser: "typescript" }
      );

      assert.equal(formattedActual, formattedExpected);
    });

    it("options should be required when there is at least one required parameter", async () => {
      const program = await getProgram(
        `
            import "@typespec/http";
  
            using TypeSpec.Http;
            @service({
              title: "Widget Service",
            })
            namespace DemoService;
  
            model Widget {
              name?: string;
            }
  
            @route("/widgets")
            @tag("Widgets")
            interface Widgets {
              @get list(...Widget, @header requestId: string): string[];
            }
          `,
        { libraries: ["Http"] }
      );

      const emitContext: EmitContext = {
        program,
      } as EmitContext;

      const tree = emitRlc(emitContext);
      const result = await renderToSourceFiles(tree);

      const formattedActual = await format(result[1].content, { parser: "typescript" });
      const formattedExpected = await format(
        `
        import { DemoServiceWidgetsget200Response } from "./models.js";
  
          export interface Client {
          (path: "/widgets"): {
            get(options: {
              body?: {name?: string}, 
              headers: {requestId: string}
            }): DemoServiceWidgetsget200Response;
          };
        }`,
        { parser: "typescript" }
      );

      assert.equal(formattedActual, formattedExpected);
    });
  });

  describe("Models", () => {
    it("should render the response model", async () => {
      const program = await getProgram(
        `
            import "@typespec/http";
  
            using TypeSpec.Http;
            @service({
              title: "Widget Service",
            })
            namespace DemoService;
  
            model Widget {
              name?: string;
            }
  
            @route("/widgets")
            @tag("Widgets")
            interface Widgets {
              @get list(...Widget, @header requestId: string): string[];
            }
          `,
        { libraries: ["Http"] }
      );

      const emitContext: EmitContext = {
        program,
      } as EmitContext;

      const tree = emitRlc(emitContext);
      const result = await renderToSourceFiles(tree);

      const formattedActual = await format(result[0].content, { parser: "typescript" });
      const formattedExpected = await format(
        `
        export interface Widget {
          name?: string;
        }
        export interface DemoServiceWidgetsget200Response {
            statusCode: "200";
            body: string[];
            headers: {};
        }`,
        { parser: "typescript" }
      );

      assert.equal(formattedActual, formattedExpected);
    });
  });
});
