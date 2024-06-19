import { Model, mutateSubgraph } from "@typespec/compiler";
import { EmitOutput, SourceFile, render } from "@typespec/efnext/framework";
import { assert, describe, it } from "vitest";
import { RestOperationParameter } from "../../src/components/rest-operation-parameter.js";
import { restOperationMutator } from "../../src/helpers/rest-operation-mutator.js";
import { createTypeTracker } from "../../src/helpers/type-tracker.js";
import { assertEqual } from "../component-utils.js";
import { getProgram } from "../test-host.js";

describe("Rest Operation Parameter Component", () => {
  describe("Rest Operations", () => {
    it("should render the operations parameter ", async () => {
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
        interface A {
          @post create(...Widget): Widget;
        }
  
        model Widget {
          name: string;
        }
          `,
        { libraries: ["Http"] }
      );

      const namespace = Array.from(program.getGlobalNamespaceType().namespaces.values()).filter(
        (n) => n.name === "DemoService"
      )[0];
      const iface = Array.from(namespace.interfaces.values()).find((i) => i.name === "A")!;
      const operation = Array.from(iface.operations.values())[0];

      const tracker = createTypeTracker();
      mutateSubgraph(program, [restOperationMutator(tracker)], operation);

      const parameters = tracker.getTracked("parameter");

      assert.isDefined(parameters);
      const parameterModel = parameters[0] as Model;

      const node = await render(
        <EmitOutput>
          <SourceFile filetype="typescript" path="test.ts">
            <RestOperationParameter type={parameterModel} />
          </SourceFile>
        </EmitOutput>
      );

      await assertEqual(
        node,
        `import { RequestOptions } from "@typespec/ts-http-runtime";

        export type DemoServiceACreateRequestParameters = RequestOptions & { body: { name: string } };`
      );
    });

    it("should render the operations parameter, including query and headers", async () => {
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
        interface A {
          @post create(...Widget): Widget;
        }
  
        model Widget {
          name: string;
          @query filter: string;
          @header authorization: string;
        }
          `,
        { libraries: ["Http"] }
      );

      const namespace = Array.from(program.getGlobalNamespaceType().namespaces.values()).filter(
        (n) => n.name === "DemoService"
      )[0];
      const iface = Array.from(namespace.interfaces.values()).find((i) => i.name === "A")!;
      const operation = Array.from(iface.operations.values())[0];

      const tracker = createTypeTracker();
      mutateSubgraph(program, [restOperationMutator(tracker)], operation);

      const parameterModel = tracker
        .getTracked("parameter")
        .find((t) => t.kind === "Model")! as Model;

      assert.isDefined(parameterModel);

      const node = await render(
        <EmitOutput>
          <SourceFile filetype="typescript" path="test.ts">
            <RestOperationParameter type={parameterModel} />
          </SourceFile>
        </EmitOutput>
      );

      await assertEqual(
        node,
        `import { RequestOptions } from "@typespec/ts-http-runtime";
        
        export type DemoServiceACreateRequestParameters = RequestOptions & { 
          queryParameters: { filter: string };
          headers: { authorization: string };
          body: { name: string }; 
        };`
      );
    });
  });
});
