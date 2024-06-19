import { Interface, Model, Operation, Scalar, Union, mutateSubgraph } from "@typespec/compiler";
import { assert, describe, it } from "vitest";
import { createTypeTracker } from "../src/helpers/type-tracker.js";
import { createVisibilityMutator } from "../src/helpers/visibility-mutator.js";
import { getProgram } from "./test-host.js";

describe("Visibility", () => {
  describe("read", () => {
    it("should use the right return type", async () => {
      const program = await getProgram(
        `
        import "@typespec/http";

        using TypeSpec.Http;
        @service({
          title: "Widget Service",
        })
        namespace DemoService;

        model Widget {
          @visibility("read", "update")
          @path
          id: string;

          weight: int32;
          color: "red" | "blue";
        }
        @route("/widgets")
        @tag("Widgets")
        interface Widgets {
          @get read(): Widget;
        }
          `,
        { libraries: ["Http"] }
      );

      const namespace = Array.from(program.getGlobalNamespaceType().namespaces.values()).filter(
        (n) => n.name === "DemoService"
      )[0];

      const iface = Array.from(namespace.interfaces.values())[0] as Interface;

      const readOperation = iface.operations.get("read")! as Operation;
      const model = Array.from(namespace.models.values())[0] as Model;

      const tracker = createTypeTracker();

      const readVisibilityMutator = createVisibilityMutator(tracker, "read");
      mutateSubgraph(program, [readVisibilityMutator], model);
      const mutated = mutateSubgraph(program, [readVisibilityMutator], readOperation);

      const mutatedOperation = mutated.type as Operation;
      assert.equal(mutatedOperation.returnType.kind, "Model");
      assert.equal((mutatedOperation.returnType as Model).name, "Widget");
    });

    it("should use the right return type when it is an array", async () => {
      const program = await getProgram(
        `
        import "@typespec/http";

        using TypeSpec.Http;
        @service({
          title: "Widget Service",
        })
        namespace DemoService;

        model Widget {
          @visibility("read", "update")
          @path
          id: string;

          weight: int32;
          color: "red" | "blue";
        }
        @route("/widgets")
        @tag("Widgets")
        interface Widgets {
          @get read(): Widget[];
        }
          `,
        { libraries: ["Http"] }
      );

      const namespace = Array.from(program.getGlobalNamespaceType().namespaces.values()).filter(
        (n) => n.name === "DemoService"
      )[0];

      const iface = Array.from(namespace.interfaces.values())[0] as Interface;

      const readOperation = iface.operations.get("read")! as Operation;
      const model = Array.from(namespace.models.values())[0] as Model;

      const tracker = createTypeTracker();

      const readVisibilityMutator = createVisibilityMutator(tracker, "read");
      mutateSubgraph(program, [readVisibilityMutator], model);
      const mutated = mutateSubgraph(program, [readVisibilityMutator], readOperation);

      const mutatedOperation = mutated.type as Operation;
      assert.equal(mutatedOperation.returnType.kind, "Model");
      // It is an array so we need to look at the indexer value
      assert.equal(
        ((mutatedOperation.returnType as Model).indexer!.value! as Model).name,
        // Since all the properties in Widget are read, then it should be the same as the original model
        "Widget"
      );
    });

    it("should use the output model for return type when it is an array", async () => {
      const program = await getProgram(
        `
        import "@typespec/http";

        using TypeSpec.Http;
        @service({
          title: "Widget Service",
        })
        namespace DemoService;

        model Widget {
          @visibility("read", "update")
          @path
          id: string;

          @visibility("update")
          etag: string;

          weight: int32;
          color: "red" | "blue";
        }
        @route("/widgets")
        @tag("Widgets")
        interface Widgets {
          @get read(): Widget[];
        }
          `,
        { libraries: ["Http"] }
      );

      const namespace = Array.from(program.getGlobalNamespaceType().namespaces.values()).filter(
        (n) => n.name === "DemoService"
      )[0];

      const iface = Array.from(namespace.interfaces.values())[0] as Interface;

      const readOperation = iface.operations.get("read")! as Operation;
      console.log(
        `Models in namespace: ${Array.from(namespace.models.values()).map((m) => m.name ?? "anonymous")}`
      );
      const model = Array.from(namespace.models.values())[0] as Model;

      const tracker = createTypeTracker();

      const readVisibilityMutator = createVisibilityMutator(tracker, "read");
      mutateSubgraph(program, [readVisibilityMutator], model);
      const mutated = mutateSubgraph(program, [readVisibilityMutator], readOperation);

      const mutatedOperation = mutated.type as Operation;
      assert.equal(mutatedOperation.returnType.kind, "Model");
      // It is an array so we need to look at the indexer value
      assert.equal(
        ((mutatedOperation.returnType as Model).indexer!.value! as Model).name,
        // Since there is one property with visibility "update", it should use the Output model
        "WidgetOutput"
      );
    });

    it("it should use the right return type when original type is an union", async () => {
      const program = await getProgram(
        `
        import "@typespec/http";

        using TypeSpec.Http;
        @service({
          title: "Widget Service",
        })
        namespace DemoService;

        @error
        model Error {
          code: int32;
          message: string;
        }

        model Widget {
          @visibility("read", "update")
          @path
          id: string;

          weight: int32;
          color: "red" | "blue";
          @visibility("update")
          etag: string;
        }
        @route("/widgets")
        @tag("Widgets")
        interface Widgets {
          @get read(): Widget | Error;
        }
          `,
        { libraries: ["Http"] }
      );

      const namespace = Array.from(program.getGlobalNamespaceType().namespaces.values()).filter(
        (n) => n.name === "DemoService"
      )[0];

      const iface = Array.from(namespace.interfaces.values())[0] as Interface;

      const readOperation = iface.operations.get("read")! as Operation;

      const tracker = createTypeTracker();

      const readVisibilityMutator = createVisibilityMutator(tracker, "read");
      for (const model of namespace.models.values()) {
        mutateSubgraph(program, [readVisibilityMutator], model);
      }

      const mutated = mutateSubgraph(program, [readVisibilityMutator], readOperation);

      const mutatedOperation = mutated.type as Operation;
      assert.equal(mutatedOperation.returnType.kind, "Union");

      const unionVariants = Array.from(
        (mutatedOperation.returnType as Union).variants.values()
      ).map((v) => v.type as Model);
      const errorModel = unionVariants.filter((v) => v.name === "Error")[0] as Model;
      assert.isDefined(errorModel);

      const widgetModel = unionVariants.filter((v) => v.name === "WidgetOutput")[0] as Model;
      assert.isDefined(widgetModel);

      const properties = widgetModel.properties;
      assert.equal(properties.size, 3);
      assert.isUndefined(properties.get("etag"));
      assert.equal((properties.get("id")!.type as Scalar).name, "string");
      assert.equal((properties.get("weight")!.type as Scalar).name, "int32");
      assert.equal((properties.get("color")!.type as Union).variants.size, 2);
    });
  });
});
