import {
  Model,
  ModelProperty,
  Operation,
  Scalar,
  StringLiteral,
  Union,
  mutateSubgraph,
} from "@typespec/compiler";
import { assert, describe, it } from "vitest";
import { restResponseMutator } from "../src/helpers/rest-operation-response-mutator.js";
import { createTypeTracker } from "../src/helpers/type-tracker.js";
import { getProgram } from "./test-host.js";

describe("e2e operation mutator", () => {
  it("should handle an operation with a single response", async () => {
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
        // This should be mutated into DemoServiceAFoo200Response
        @get foo(): Widget;
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

    const { type } = mutateSubgraph(program, [restResponseMutator(tracker)], operation);
    const mutatedOperation = type as Operation;

    assert.equal((mutatedOperation.returnType as any).name, "DemoServiceAFoo200Response");

    const response = mutatedOperation.returnType as Model;

    assert.equal(response.properties.size, 3);

    const statusCode = response.properties.get("status")!;
    assert.isDefined(statusCode);
    assert.equal(statusCode.type.kind, "String");
    assert.equal((statusCode.type as StringLiteral).value, "200");

    const body = response.properties.get("body")!;
    assert.isDefined(body);
    assert.equal(body.type.kind, "Model");
    assert.equal((body.type as Model).name, "Widget");
    assert.isDefined((body.type as Model).properties.get("name"));
  });

  it("should handle an operation with responses for different content-types", async () => {
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
        // This should be mutated into DemoServiceAFoo200Response
        @get foo(): Widget | BinaryWidget;
      }

      model Widget {
        @header contentType: "application/json";
        name: string;
      }

      model BinaryWidget {
        @header contentType: "application/octet-stream";
        content: bytes;
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

    const { type } = mutateSubgraph(program, [restResponseMutator(tracker)], operation);
    const mutatedOperation = type as Operation;

    assert.equal(mutatedOperation.returnType.kind, "Union");

    const responseUnion = mutatedOperation.returnType as Union;

    assert.equal(responseUnion.variants.size, 2);

    const variants = Array.from(responseUnion.variants.values());

    const widgetModel = variants[0].type as Model;
    assert.equal(widgetModel.name, "DemoServiceAFoo200Response");
    assert.equal((widgetModel.properties.get("status")?.type as StringLiteral).value, "200");

    const widgetModelHeaders = widgetModel.properties.get("headers")! as ModelProperty;
    assert.isDefined(widgetModelHeaders);
    assert.equal(widgetModelHeaders.type.kind, "Model");

    const widgetResponseContentType = (widgetModelHeaders.type as Model).properties.get(
      "content-type"
    ) as ModelProperty;
    assert.equal((widgetResponseContentType.type as StringLiteral).value, "application/json");

    const binaryWidgetModel = variants[1].type as Model;
    assert.equal(binaryWidgetModel.name, "DemoServiceAFoo200ApplicationOctetStreamResponse");
    assert.equal((binaryWidgetModel.properties.get("status")?.type as StringLiteral).value, "200");

    const binaryWidgetModelHeaders = binaryWidgetModel.properties.get("headers")! as ModelProperty;

    assert.isDefined(binaryWidgetModelHeaders);
    assert.equal(binaryWidgetModelHeaders.type.kind, "Model");

    const binaryWidgetResponseContentType = (binaryWidgetModelHeaders.type as Model).properties.get(
      "content-type"
    ) as ModelProperty;
    assert.equal(
      (binaryWidgetResponseContentType.type as StringLiteral).value,
      "application/octet-stream"
    );

    const binaryResponseBody = binaryWidgetModel.properties.get("body")!;
    assert.isDefined(binaryResponseBody);
    assert.equal(binaryResponseBody.type.kind, "Model");
    assert.isDefined((binaryResponseBody.type as Model).properties.get("content"));
    assert.equal((binaryResponseBody.type as Model).properties.get("content")?.type.kind, "Scalar");
    assert.equal(
      ((binaryResponseBody.type as Model).properties.get("content")?.type as Scalar).name,
      "bytes"
    );
  });

  it("should handle an operation with a single response and an error", async () => {
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

      @route("/widgets")
      @tag("Widgets")
      interface A {
        // This should be mutated into DemoServiceAFoo200Response
        @get foo(): Widget | Error;
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

    const { type } = mutateSubgraph(program, [restResponseMutator(tracker)], operation);
    const mutatedOperation = type as Operation;

    const response = mutatedOperation.returnType as Union;

    assert.equal(response.kind, "Union");
    assert.equal(response.variants.size, 2);
    const variants = Array.from(response.variants.values());
    const successResponse = variants[0].type as Model;
    assert.isDefined(successResponse);
    assert.equal(successResponse.name, "DemoServiceAFoo200Response");

    assert.equal(successResponse.properties.size, 3);

    const statusCode = successResponse.properties.get("status")!;
    assert.isDefined(statusCode);
    assert.equal(statusCode.type.kind, "String");
    assert.equal((statusCode.type as StringLiteral).value, "200");

    const body = successResponse.properties.get("body")!;
    assert.isDefined(body);
    assert.equal(body.type.kind, "Model");
    assert.equal((body.type as Model).name, "Widget");
    assert.isDefined((body.type as Model).properties.get("name"));

    const errorResponse = variants[1].type as Model;
    assert.isDefined(errorResponse);
    assert.equal(errorResponse.name, "DemoServiceAFooDefaultResponse");

    assert.equal(errorResponse.properties.size, 3);

    const errorStatusCode = errorResponse.properties.get("status")!;
    assert.isDefined(errorStatusCode);
    assert.equal(errorStatusCode.type.kind, "Scalar");
    assert.equal((errorStatusCode.type as Scalar).name, "string");

    const errorBody = errorResponse.properties.get("body")!;
    assert.isDefined(errorBody);
    assert.equal(errorBody.type.kind, "Model");
    assert.equal((errorBody.type as Model).name, "Error");
    assert.isDefined((errorBody.type as Model).properties.get("code"));
    assert.isDefined((errorBody.type as Model).properties.get("message"));
  });

  it("should handle an operation with a 2 responses and an error", async () => {
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

      @route("/widgets")
      @tag("Widgets")
      interface A {
        // This should be mutated into DemoServiceAFoo200Response
        @get foo(): Widget | SubWidget | Error;
      }

      model Widget {
        @statusCode status: 200;
        name: string;
      }

      model SubWidget {
        @statusCode status: 204;
        subName: string;
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

    const { type } = mutateSubgraph(program, [restResponseMutator(tracker)], operation);
    const mutatedOperation = type as Operation;

    const response = mutatedOperation.returnType as Union;

    assert.equal(response.kind, "Union");
    assert.equal(response.variants.size, 3);
    const variants = Array.from(response.variants.values());
    const successResponse = variants[0].type as Model;
    assert.isDefined(successResponse);
    assert.equal(successResponse.name, "DemoServiceAFoo200Response");

    assert.equal(successResponse.properties.size, 3);

    const statusCode = successResponse.properties.get("status")!;
    assert.isDefined(statusCode);
    assert.equal(statusCode.type.kind, "String");
    assert.equal((statusCode.type as StringLiteral).value, "200");

    const body = successResponse.properties.get("body")!;
    assert.isDefined(body);
    assert.equal(body.type.kind, "Model");
    // For some reason when there are 2 success responses the Model name is empty need to investigate this
    assert.equal((body.type as Model).name, "");
    assert.isDefined((body.type as Model).properties.get("name"));

    const successResponse2 = variants[1].type as Model;
    assert.isDefined(successResponse2);
    assert.equal(successResponse2.name, "DemoServiceAFoo204Response");

    assert.equal(successResponse2.properties.size, 3);

    const statusCode2 = successResponse2.properties.get("status")!;
    assert.isDefined(statusCode2);
    assert.equal(statusCode2.type.kind, "String");
    assert.equal((statusCode2.type as StringLiteral).value, "204");

    const body2 = successResponse2.properties.get("body")!;
    assert.isDefined(body2);
    assert.equal(body2.type.kind, "Model");
    // For some reason when there are 2 success responses the Model name is empty need to investigate this
    assert.equal((body2.type as Model).name, "");
    assert.isDefined((body2.type as Model).properties.get("subName"));

    const errorResponse = variants[2].type as Model;
    assert.isDefined(errorResponse);
    assert.equal(errorResponse.name, "DemoServiceAFooDefaultResponse");

    assert.equal(errorResponse.properties.size, 3);

    const errorStatusCode = errorResponse.properties.get("status")!;
    assert.isDefined(errorStatusCode);
    assert.equal(errorStatusCode.type.kind, "Scalar");
    assert.equal((errorStatusCode.type as Scalar).name, "string");

    const errorBody = errorResponse.properties.get("body")!;
    assert.isDefined(errorBody);
    assert.equal(errorBody.type.kind, "Model");
    assert.equal((errorBody.type as Model).name, "Error");
    assert.isDefined((errorBody.type as Model).properties.get("code"));
    assert.isDefined((errorBody.type as Model).properties.get("message"));
  });
});
