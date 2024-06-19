import { Namespace } from "@typespec/compiler";
import { describe, it } from "vitest";
import { EmitOutput } from "../src/framework/components/emit-output.js";
import { SourceFile } from "../src/framework/components/source-file.js";
import { code } from "../src/framework/core/code.js";
import { render } from "../src/framework/core/render.js";
import { FunctionDeclaration } from "../src/typescript/function-declaration.js";
import { assertEqual } from "./component-utils.js";
import { getProgram } from "./test-host.js";

describe("Typescript Function Declaration", () => {
  describe("Function bound to Typespec Types", () => {
    describe("Bound to Operation", () => {
      it("creates a function", async () => {
        const program = await getProgram(`
        namespace DemoService;
        op getName(id: string): string;
        `);

        const [namespace] = program.resolveTypeReference("DemoService");
        const operation = Array.from((namespace as Namespace).operations.values())[0];

        let res = await render(
          <EmitOutput>
            <SourceFile filetype="typescript" path="test.ts">
              <FunctionDeclaration type={operation} />
            </SourceFile>
          </EmitOutput>
        );

        await assertEqual(res, `export function getName(id: string): string{}`);
      });

      it("can override name", async () => {
        const program = await getProgram(`
        namespace DemoService;
        op getName(id: string): string;
        `);

        const [namespace] = program.resolveTypeReference("DemoService");
        const operation = Array.from((namespace as Namespace).operations.values())[0];

        let res = await render(
          <EmitOutput>
            <SourceFile filetype="typescript" path="test.ts">
              <FunctionDeclaration name="newName" type={operation} />
            </SourceFile>
          </EmitOutput>
        );

        await assertEqual(res, `export function newName(id: string): string{}`);
      });

      it("can override parameters with raw params provided", async () => {
        const program = await getProgram(`
        namespace DemoService;
        op createPerson(id: string): string;
        `);

        const [namespace] = program.resolveTypeReference("DemoService");
        const operation = Array.from((namespace as Namespace).operations.values())[0];

        let res = await render(
          <EmitOutput>
            <SourceFile filetype="typescript" path="test.ts">
              <FunctionDeclaration
                type={operation}
                parameters={{ name: "string", age: "number" }}
              />
            </SourceFile>
          </EmitOutput>
        );

        await assertEqual(res, `export function createPerson(name: string, age: number): string{}`);
      });

      it("can override parameters with an array of ModelProperties", async () => {
        const program = await getProgram(`
        namespace DemoService;
        op createPerson(id: string): string;

        model Foo {
          name: string;
          age: int32;
        }
        `);

        const [namespace] = program.resolveTypeReference("DemoService");
        const operation = Array.from((namespace as Namespace).operations.values())[0];
        const model = Array.from((namespace as Namespace).models.values())[0];

        let res = await render(
          <EmitOutput>
            <SourceFile filetype="typescript" path="test.ts">
              <FunctionDeclaration type={operation}>
                <FunctionDeclaration.Parameters parameters={[...model.properties.values()]} />
              </FunctionDeclaration>
            </SourceFile>
          </EmitOutput>
        );

        await assertEqual(res, `export function createPerson(name: string, age: number): string{}`);
      });

      it("can render function body", async () => {
        const program = await getProgram(`
        namespace DemoService;
        op createPerson(id: string): string;
        `);

        const [namespace] = program.resolveTypeReference("DemoService");
        const operation = Array.from((namespace as Namespace).operations.values())[0];

        let res = await render(
          <EmitOutput>
            <SourceFile filetype="typescript" path="test.ts">
              <FunctionDeclaration type={operation}>
                {code`
                  const message = "Hello World!";
                  console.log(message);
                `}
              </FunctionDeclaration>
            </SourceFile>
          </EmitOutput>
        );

        await assertEqual(
          res,
          `export function createPerson(id: string): string {
               const message = "Hello World!";
               console.log(message);
           }`
        );
      });
    });
  });
});
