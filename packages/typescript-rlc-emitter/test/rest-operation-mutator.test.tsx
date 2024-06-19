import { Model, ModelProperty, Operation, mutateSubgraph } from "@typespec/compiler";
import { assert, describe, it } from "vitest";
import { restOperationMutator } from "../src/helpers/rest-operation-mutator.js";
import { createTypeTracker } from "../src/helpers/type-tracker.js";
import { getProgram } from "./test-host.js";

describe("e2e operation mutator", () => {
  describe("non-http operations", () => {
    //TODO: Find a good way to tell if an operation is an http operation
    it.skip("should not mutate operation if not http", async () => {
      const program = await getProgram(
        `
        namespace DemoService;
  
        interface A {
          foo(): Widget;
        }
  
        model Widget {
          name: string;
        }
          `
      );

      const namespace = Array.from(program.getGlobalNamespaceType().namespaces.values()).filter(
        (n) => n.name === "DemoService"
      )[0];

      const iface = Array.from(namespace.interfaces.values()).find((i) => i.name === "A")!;
      const operation = Array.from(iface.operations.values())[0];

      const tracker = createTypeTracker();

      const { type } = mutateSubgraph(program, [restOperationMutator(tracker)], operation);
      const mutatedOperation = type as Operation;

      assert.equal(mutatedOperation.name, "foo");
    });
  });
  describe("parameters mutation", () => {
    it("should handle body when is named but not decorated", async () => {
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
          @post create(param: Widget): Widget;
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
      const { type } = mutateSubgraph(program, [restOperationMutator(tracker)], operation);
      const mutatedOperation = type as Operation;

      const parameters = Array.from(mutatedOperation.parameters.properties.values());

      // The structure we are looking to get is the following
      // op get(options: DemoServiceACreateRequestOptions): Widget;
      // In TypeSpec the parameters are represented as an anonymous model with the properties listed in the operation
      // in this case {options: DemoServiceACreateRequestOptions} or {options: {body: {param: {name: string}}}} if we make options an anonymous model
      // for now options is a named model so we are looking for the first shape

      assert.equal(mutatedOperation.name, "post");
      assert.equal(parameters.length, 1);
      assert.equal(parameters[0].name, "options");
      assert.equal((parameters[0].type as Model).name, "DemoServiceACreateRequestParameters");
      // If at least one children property is required, the whole options should be required
      assert.equal(parameters[0].optional, false);

      const options = parameters[0].type as Model;
      assert.equal(options.properties.size, 1);
      // When the body is not decorated, the body is an anonymous model with the parameters listed in the operation {options: {body: {param: {name: string}}}}
      // since we are creating a named model for the parameters then we are expecting for {options: DemoServiceACreateRequestOptions}]
      // const properties = Array.from(body.properties.values());
      assert.isDefined(options.properties.get("body") as ModelProperty);
      const body = options.properties.get("body")!.type as Model;
      assert.isDefined(body.properties.get("param") as ModelProperty);
    });

    it("should only have body property", async () => {
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
      const { type } = mutateSubgraph(program, [restOperationMutator(tracker)], operation);
      const mutatedOperation = type as Operation;

      const parameters = Array.from(mutatedOperation.parameters.properties.values());

      assert.equal(mutatedOperation.name, "post");
      assert.equal(parameters.length, 1);
      assert.equal(parameters[0].name, "options");

      const options = parameters[0].type as Model;
      assert.equal(options.name, "DemoServiceACreateRequestParameters");
      assert.equal(options.properties.size, 1);
      assert.isDefined(options.properties.get("body") as ModelProperty);

      const body = options.properties.get("body")!.type as Model;
      assert.equal(body.name, "");
      assert.equal(body.properties.size, 1);
      assert.isDefined(body.properties.get("name") as ModelProperty);
    });

    it("options should be optional if there are no required parameters", async () => {
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
          name?: string;
          @query filter?: string;
          @header requestId?: string;
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
      const { type } = mutateSubgraph(program, [restOperationMutator(tracker)], operation);
      const mutatedOperation = type as Operation;

      const parameters = Array.from(mutatedOperation.parameters.properties.values());
      assert.equal(parameters.length, 1);
      assert.equal(parameters[0].name, "options");
      assert.equal(parameters[0].optional, true);
    });

    it("options should be required if there is at least one required parameter", async () => {
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
          @query filter?: string;
          @header requestId?: string;
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
      const { type } = mutateSubgraph(program, [restOperationMutator(tracker)], operation);
      const mutatedOperation = type as Operation;

      const parameters = Array.from(mutatedOperation.parameters.properties.values());
      assert.equal(parameters.length, 1);
      assert.equal(parameters[0].name, "options");
      assert.equal(parameters[0].optional, false);
    });

    it("options should be required if there is at least one required parameter, nested", async () => {
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
          name?: string;
          @query filter?: string;
          @header requestId?: string;
          nested?: {
            value: string
          }
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

      const { type } = mutateSubgraph(program, [restOperationMutator(tracker)], operation);
      const mutatedOperation = type as Operation;

      const parameters = Array.from(mutatedOperation.parameters.properties.values());
      assert.equal(parameters.length, 1);
      assert.equal(parameters[0].name, "options");
      assert.equal(parameters[0].optional, false);
    });

    it("should only correctly create body, header and query properties", async () => {
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
          @header requestId: string;
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

      const { type } = mutateSubgraph(program, [restOperationMutator(tracker)], operation);
      const mutatedOperation = type as Operation;

      const parameters = Array.from(mutatedOperation.parameters.properties.values());

      assert.equal(mutatedOperation.name, "post");
      assert.equal(parameters.length, 1);

      const optionsParam = parameters.find((p) => p.name === "options")!.type as Model;
      assert.isDefined(optionsParam);

      const body = optionsParam.properties.get("body")!.type as Model;

      const bodyProperties = Array.from(body.properties.values());
      assert.equal(bodyProperties.length, 1);
      assert.equal(bodyProperties[0].name, "name");

      const queryParam = optionsParam.properties.get("queryParameters")!.type as Model;
      assert.isDefined(queryParam);

      const queryProperties = Array.from(queryParam.properties.values());
      assert.equal(queryProperties.length, 1);
      assert.equal(queryProperties[0].name, "filter");

      const headerParam = optionsParam.properties.get("headers")!.type as Model;
      assert.isDefined(headerParam);

      const headerProperties = Array.from(headerParam.properties.values());
      assert.equal(headerProperties.length, 1);
      assert.equal(headerProperties[0].name, "requestId");
    });
  });
});
