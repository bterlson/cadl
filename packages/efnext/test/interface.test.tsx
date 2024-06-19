import { Namespace } from "@typespec/compiler";
import { describe, it } from "vitest";
import { EmitOutput } from "../src/framework/components/emit-output.js";
import { SourceFile } from "../src/framework/components/source-file.js";
import { render } from "../src/framework/core/render.js";
import { InterfaceDeclaration } from "../src/typescript/interface-declaration.js";
import { assertEqual } from "./component-utils.js";
import { getProgram } from "./test-host.js";

describe("Typescript Interface", () => {
  describe("Interface bound to Typespec Types", () => {
    describe("Bound to Model", () => {
      it("creates an interface", async () => {
        const program = await getProgram(`
        namespace DemoService;
    
        model Widget{
          id: string;
          weight: int32;
          color: "blue" | "red";
        }
        `);

        const [namespace] = program.resolveTypeReference("DemoService");
        const models = Array.from((namespace as Namespace).models.values());

        let res = await render(
          <EmitOutput>
            <SourceFile filetype="typescript" path="test.ts">
              <InterfaceDeclaration type={models[0]} />
            </SourceFile>
          </EmitOutput>
        );

        await assertEqual(
          res,
          `export interface Widget {
          id: string;
          weight: number;
          color: "blue" | "red";
         }`
        );
      });

      it("can override interface name", async () => {
        const program = await getProgram(`
        namespace DemoService;
    
        model Widget{
          id: string;
          weight: int32;
          color: "blue" | "red";
        }
        `);

        const [namespace] = program.resolveTypeReference("DemoService");
        const models = Array.from((namespace as Namespace).models.values());

        let res = await render(
          <EmitOutput>
            <SourceFile filetype="typescript" path="test.ts">
              <InterfaceDeclaration name="MyOperations" type={models[0]} />
            </SourceFile>
          </EmitOutput>
        );

        await assertEqual(
          res,
          `export interface MyOperations {
          id: string;
          weight: number;
          color: "blue" | "red";
         }`
        );
      });

      it("can add a members to the interface", async () => {
        const program = await getProgram(`
        namespace DemoService;
    
        model Widget{
          id: string;
          weight: int32;
          color: "blue" | "red";
        }
        `);

        const [namespace] = program.resolveTypeReference("DemoService");
        const models = Array.from((namespace as Namespace).models.values());

        let res = await render(
          <EmitOutput>
            <SourceFile filetype="typescript" path="test.ts">
              <InterfaceDeclaration name="MyOperations" type={models[0]}>
                customProperty: string; <br />
                customMethod(): void;
              </InterfaceDeclaration>
            </SourceFile>
          </EmitOutput>
        );

        await assertEqual(
          res,
          `export interface MyOperations {
          id: string;
          weight: number;
          color: "blue" | "red";
          customProperty: string;
          customMethod(): void;
        }`
        );
      });

      it("interface name can be customized", async () => {
        const program = await getProgram(`
        namespace DemoService;
    
        model Widget{
          id: string;
          weight: int32;
          color: "blue" | "red";
        }
        `);

        const [namespace] = program.resolveTypeReference("DemoService");
        const models = Array.from((namespace as Namespace).models.values());

        let res = await render(
          <EmitOutput>
            <SourceFile filetype="typescript" path="test.ts">
              <InterfaceDeclaration name="MyModel" type={models[0]} />
            </SourceFile>
          </EmitOutput>
        );

        await assertEqual(
          res,
          `export interface MyModel {
            id: string;
            weight: number;
            color: "blue" | "red";
        }`
        );
      });

      it("interface with extends", async () => {
        const program = await getProgram(`
        namespace DemoService;
    
        model Widget{
          id: string;
          weight: int32;
          color: "blue" | "red";
        }
        
        model ErrorWidget extends Widget {
          code: int32;
          message: string;
        }
        `);

        const [namespace] = program.resolveTypeReference("DemoService");
        const models = Array.from((namespace as Namespace).models.values());

        let res = await render(
          <EmitOutput>
            <SourceFile filetype="typescript" path="test.ts">
              {models.map((model) => (
                <InterfaceDeclaration type={model} />
              ))}
            </SourceFile>
          </EmitOutput>
        );

        await assertEqual(
          res,
          `export interface Widget {
            id: string;
            weight: number;
            color: "blue" | "red";
          }
          export interface ErrorWidget extends Widget {
            code: number;
            message: string;
          }`
        );
      });
    });

    describe("Bound to Interface", () => {
      it("creates an interface", async () => {
        const program = await getProgram(`
        namespace DemoService;
    
        interface WidgetOperations {
          op getName(id: string): string;
        }
        `);

        const [namespace] = program.resolveTypeReference("DemoService");
        const interfaces = Array.from((namespace as Namespace).interfaces.values());

        let res = await render(
          <EmitOutput>
            <SourceFile filetype="typescript" path="test.ts">
              <InterfaceDeclaration type={interfaces[0]} />
            </SourceFile>
          </EmitOutput>
        );

        await assertEqual(
          res,
          `export interface WidgetOperations {
          getName(id: string): string;
        }`
        );
      });

      it("should handle spread and non spread model parameters", async () => {
        const program = await getProgram(`
        namespace DemoService;

        model Foo {
          name: string
        }
    
        interface WidgetOperations {
          op getName(foo: Foo): string;
          op getOtherName(...Foo): string
        }
        `);

        const [namespace] = program.resolveTypeReference("DemoService");
        const interfaces = Array.from((namespace as Namespace).interfaces.values());
        const models = Array.from((namespace as Namespace).models.values());

        let res = await render(
          <EmitOutput>
            <SourceFile filetype="typescript" path="test.ts">
              <InterfaceDeclaration type={interfaces[0]} />
              <InterfaceDeclaration type={models[0]} />
            </SourceFile>
          </EmitOutput>
        );

        await assertEqual(
          res,
          `export interface WidgetOperations {
          getName(foo: Foo): string;
          getOtherName(name: string): string
        }
        export interface Foo {
          name: string;
        }  
        `
        );
      });

      it("creates an interface with Model references", async () => {
        const program = await getProgram(`
        namespace DemoService;
    
        interface WidgetOperations {
          op getName(id: string): Widget;
        }

        model Widget {
          id: string;
          weight: int32;
          color: "blue" | "red";
        }
        `);

        const [namespace] = program.resolveTypeReference("DemoService");
        const interfaces = Array.from((namespace as Namespace).interfaces.values());
        const models = Array.from((namespace as Namespace).models.values());

        let res = await render(
          <EmitOutput>
            <SourceFile filetype="typescript" path="test.ts">
              <InterfaceDeclaration type={interfaces[0]} />
              {models.map((model) => (
                <InterfaceDeclaration type={model} />
              ))}
            </SourceFile>
          </EmitOutput>
        );

        await assertEqual(
          res,
          `export interface WidgetOperations {
          getName(id: string): Widget;
        }
        export interface Widget {
          id: string;
          weight: number;
          color: "blue" | "red";
        }`
        );
      });

      it("creates an interface that extends another", async () => {
        const program = await getProgram(`
        namespace DemoService;
    
        interface WidgetOperations {
          op getName(id: string): Widget;
        }

        interface WidgetOperationsExtended extends WidgetOperations{
          op delete(id: string): void;
        }

        model Widget {
          id: string;
          weight: int32;
          color: "blue" | "red";
        }
        `);

        const [namespace] = program.resolveTypeReference("DemoService");
        const interfaces = Array.from((namespace as Namespace).interfaces.values());
        const models = Array.from((namespace as Namespace).models.values());

        let res = await render(
          <EmitOutput>
            <SourceFile filetype="typescript" path="test.ts">
              <InterfaceDeclaration type={interfaces[1]} />
              {models.map((model) => (
                <InterfaceDeclaration type={model} />
              ))}
            </SourceFile>
          </EmitOutput>
        );

        await assertEqual(
          res,
          `export interface WidgetOperationsExtended {
          getName(id: string): Widget;
          delete(id: string): void;
        }
        export interface Widget {
          id: string;
          weight: number;
          color: "blue" | "red";
        }`
        );
      });
    });
  });
});
