import { ModelProperty, Mutator, MutatorFlow, Operation, mutateSubgraph } from "@typespec/compiler";
import { getHttpOperation } from "@typespec/http";
import { assert, describe, it } from "vitest";
import { render } from "../src/framework/core/render.js";
import { emitTypescriptInterfaces } from "../src/typescript-interface-emitter.js";
import { assertEqual } from "./component-utils.js";
import { getProgram } from "./test-host.js";

// This is a mutator that changes the operation shape into the shape of an RLC path operation.
export function createRlcMutator(kind: "operation"): Mutator {
  return {
    name: kind + "Rlc",

    Operation: {
      filter(o, program, realm) {
        const [httpOperation] = getHttpOperation(program, o);
        if (!httpOperation) {
          return MutatorFlow.DontMutate;
        }

        return true;
      },
      mutate(o, clone, program, realm) {
        const [httpOperation] = getHttpOperation(program, o);

        if (clone.name) {
          clone.name = "path";
        }

        const decoratorArgs: any[] = [
          /* decorator arguments */
        ];

        const modelOptions = {
          extends: undefined, // or some base model
          namespace: undefined, // or some namespace
          // other options
        };

        const modelPropeties: ModelProperty[] = [];

        const pathType = realm.typeFactory.stringLiteral(httpOperation.path);
        const params = realm.typeFactory.modelProperty(...decoratorArgs, "pathParam", pathType);

        modelPropeties.push(params);

        const paramsModel = realm.typeFactory.model(
          ...decoratorArgs,
          "",
          modelPropeties,
          modelOptions
        );
        realm.typeFactory.finishType(paramsModel);
        clone.parameters = paramsModel;
      },
    },
  };
}

describe("e2e operation mutator", () => {
  it("should not mutate operation name if no http", async () => {
    const program = await getProgram(
      `
          interface A {
            foo(): void;
          }
        `,
      { libraries: ["Http"] }
    );

    const result = await render(emitTypescriptInterfaces(program));

    await assertEqual(
      result,
      `export interface A {
          foo(): void
        }`
    );
  });

  it("should mutate operation if http", async () => {
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
        @get foo(): void;
      }
        `,
      { libraries: ["Http"] }
    );

    const namespace = Array.from(program.getGlobalNamespaceType().namespaces.values()).filter(
      (n) => n.name === "DemoService"
    )[0];
    const iface = Array.from(namespace.interfaces.values()).find((i) => i.name === "A")!;
    const operation = Array.from(iface.operations.values())[0];

    const { type } = mutateSubgraph(program, [createRlcMutator("operation")], operation);
    const mutatedOperation = type as Operation;

    assert.equal(mutatedOperation.name, "path");

    const parameters = [...mutatedOperation.parameters.properties.values()].map((m) => [
      m.name,
      (m.type as any).value,
    ]);
    const [paramName, path] = parameters[0];
    assert.equal(path, "/widgets");
    assert.equal(paramName, "pathParam");
  });
});
