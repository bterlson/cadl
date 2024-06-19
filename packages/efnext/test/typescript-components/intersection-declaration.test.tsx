import { Namespace } from "@typespec/compiler";
import { describe, it } from "vitest";
import { EmitOutput } from "../../src/framework/components/emit-output.js";
import { SourceFile } from "../../src/framework/components/source-file.js";
import { render } from "../../src/framework/core/render.js";
import { InterfaceDeclaration } from "../../src/typescript/interface-declaration.js";
import {
  IntersectionConstituent,
  IntersectionDeclaration,
} from "../../src/typescript/intersection-declaration.js";
import { assertEqual } from "../component-utils.js";
import { getProgram } from "../test-host.js";

describe("Intersection Declaration", () => {
  it("should render a type declaration for a model", async () => {
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
          <IntersectionDeclaration type={models[0]} />
        </SourceFile>
      </EmitOutput>
    );

    await assertEqual(
      res,
      `export type Widget = { id: string; weight: number; color: "blue" | "red" };`
    );
  });

  it("should render a type declaration for a model and a constituent", async () => {
    const program = await getProgram(`
      namespace DemoService;
  
      model Widget{
        id: string;
        weight: int32;
        color: "blue" | "red";
      }

      model Telemetry {
         eventId: string;
      }
      `);

    const [namespace] = program.resolveTypeReference("DemoService");
    const models = Array.from((namespace as Namespace).models.values());
    const widget = models[0];
    const telemetry = models[1];

    let res = await render(
      <EmitOutput>
        <SourceFile filetype="typescript" path="test.ts">
          <InterfaceDeclaration type={telemetry} />
          <IntersectionDeclaration type={widget}>
            <IntersectionConstituent type={telemetry} />
          </IntersectionDeclaration>
        </SourceFile>
      </EmitOutput>
    );

    await assertEqual(
      res,
      `export interface Telemetry {
      eventId: string;
      }
      export type Widget = Telemetry & {
        id: string;
        weight: number;
        color: "blue" | "red";
      };`
    );
  });

  it("should render a type declaration for a model and multiple constituents", async () => {
    const program = await getProgram(`
      namespace DemoService;
  
      model Widget{
        id: string;
        weight: int32;
        color: "blue" | "red";
      }

      model Telemetry {
         eventId: string;
      }

      model Logging {
         logLevel: string;
      }
      `);

    const [namespace] = program.resolveTypeReference("DemoService");
    const models = Array.from((namespace as Namespace).models.values());
    const widget = models[0];
    const telemetry = models[1];
    const logging = models[2];

    let res = await render(
      <EmitOutput>
        <SourceFile filetype="typescript" path="test.ts">
          <InterfaceDeclaration type={logging} />
          <InterfaceDeclaration type={telemetry} />
          <IntersectionDeclaration type={widget}>
            <IntersectionConstituent type={telemetry} />
            <IntersectionConstituent type={logging} />
          </IntersectionDeclaration>
        </SourceFile>
      </EmitOutput>
    );

    await assertEqual(
      res,
      `export interface Logging {
      logLevel: string;
      }
      export interface Telemetry {
      eventId: string;
      }
      export type Widget = Telemetry & Logging & { id: string; weight: number; color: "blue" | "red";};`
    );
  });

  it("should render a type declaration for a model with constituents, and honor children", async () => {
    const program = await getProgram(`
      namespace DemoService;
  
      model Widget{
        id: string;
        weight: int32;
        color: "blue" | "red";
      }

      model Telemetry {
         eventId: string;
      }

      model Logging {
         logLevel: string;
      }
      `);

    const [namespace] = program.resolveTypeReference("DemoService");
    const models = Array.from((namespace as Namespace).models.values());
    const widget = models[0];
    const telemetry = models[1];
    const logging = models[2];

    let res = await render(
      <EmitOutput>
        <SourceFile filetype="typescript" path="test.ts">
          <InterfaceDeclaration type={logging} />
          <InterfaceDeclaration type={telemetry} />
          <IntersectionDeclaration type={widget}>
            <IntersectionConstituent type={telemetry} />
            <IntersectionConstituent type={logging} />
            myProp: string;
          </IntersectionDeclaration>
        </SourceFile>
      </EmitOutput>
    );

    await assertEqual(
      res,
      `export interface Logging {
      logLevel: string;
      }
      export interface Telemetry {
      eventId: string;
      }
      export type Widget = Telemetry & Logging & { id: string; weight: number; color: "blue" | "red"; myProp: string};`
    );
  });
});
