import { render } from "@typespec/efnext/framework";
import { describe, it } from "vitest";
import { emitTypescriptInterfaces } from "../src/index.js";
import { assertEqual } from "./component-utils.js";
import { getProgram } from "./test-host.js";

describe("e2e typescript interface emitter", () => {
  it("emits models", async () => {
    const program = await getProgram(`
          model A {
            x: {
              y: string;
            },
          }
        `);

    const result = await render(emitTypescriptInterfaces(program));

    await assertEqual(
      result,
      `export interface A {
          x: { y: string }
        }`
    );
  });

  it("emits literal types", async () => {
    const contents = await getProgram(`
      model A {
        x: true,
        y: "hi",
        z: 12
      }
    `);

    const result = await render(emitTypescriptInterfaces(contents));
    await assertEqual(
      result,
      `export interface A {
        x: true,
        y: "hi",
        z: 12
      
    }`
    );
  });

  it("emits unknown", async () => {
    const contents = await getProgram(`
      model A {
        x: unknown
      }
    `);

    const result = await render(emitTypescriptInterfaces(contents));

    await assertEqual(
      result,
      `export interface A {
        x: unknown
    }`
    );
  });

  it("emits array literals", async () => {
    const contents = await getProgram(`
      model HasArray {
        x: string[];
        y: string[];
        z: (string | int32)[]
      }
    `);

    const result = await render(emitTypescriptInterfaces(contents));
    await assertEqual(
      result,
      `export interface HasArray {
      x: string[];
      y: string[];
      z: (string | number)[];
      }`
    );
  });

  it("emits operations", async () => {
    const contents = await getProgram(`
      model SomeModel {
        x: string;
      }
      op read(x: string, y: int32, z: { inline: true }, q?: SomeModel): string;
    `);

    const result = await render(emitTypescriptInterfaces(contents));
    await assertEqual(
      result,
      `export interface SomeModel {
        x: string
      }
      export function read(x: string, y: number, z: { inline: true }, q?: SomeModel): string{}`
    );
  });

  it("emits interfaces", async () => {
    const contents = await getProgram(`
      model Foo {
        prop: string;
      }
      op Callback(x: string): string;

      interface Things {
        op read(x: string): string;
        op write(y: Foo): Foo;
        op callCb(cb: Callback): string;
      }

      interface Template {
        op read(): string;
        op write(): string;
      }
    `);

    const result = await render(emitTypescriptInterfaces(contents));

    await assertEqual(
      result,
      `export interface Foo {
        prop: string
      }
      export function Callback(x: string): string{}
      export interface Things {
        read(x: string): string
        write(y: Foo): Foo
        callCb(cb: Callback): string
      }
      export interface Template {
        read(): string
        write():  string
      }`
    );
  });

  it("emits enums", async () => {
    const contents = await getProgram(`
      enum StringEnum {
        x; y: "hello";
      }

      enum NumberEnum {
        x: 1;
        y: 2;
        z: 3;
      }
    `);

    const result = await render(emitTypescriptInterfaces(contents));

    await assertEqual(
      result,
      `export enum StringEnum {
        x,
        y = "hello"
      }
      export enum NumberEnum {
        x = 1,
        y = 2,
        z = 3
      }`
    );
  });

  // TODO: Support template parameter
  it("emits unions", async () => {
    const contents = await getProgram(`
      model SomeModel {
        a: 1 | 2 | SomeModel;
        b: string;
      };

      union U {
        x: 1,
        y: "hello",
        z: SomeModel
      }

    `);

    const result = await render(emitTypescriptInterfaces(contents));

    await assertEqual(
      result,
      `export interface SomeModel {
        a: 1 | 2 | SomeModel;
        b: string;
      }
      export type U = 1 | "hello" | SomeModel`
    );
  });

  it("emits tuple types", async () => {
    const contents = await getProgram(`
      model Foo {
        x: [string, int32];
      }
    `);

    const result = await render(emitTypescriptInterfaces(contents));
    await assertEqual(
      result,
      `export interface Foo {
        x: [string, number]
      }`
    );
  });

  it("emits enum member references", async () => {
    const contents = await getProgram(`
      enum MyEnum {
        a: "hi";
        b: "bye";
      }
      
      model EnumReference {
        prop: MyEnum.a;
        prop2: MyEnum.b;
      }
    `);

    const result = await render(emitTypescriptInterfaces(contents));
    await assertEqual(
      result,
      `export interface EnumReference {
        prop: MyEnum.a;
        prop2: MyEnum.b;
      }
      export enum MyEnum {
        a = "hi",
        b = "bye"
      }`
    );
  });

  // TODO: Support scalars
  it("emits scalars", async () => {
    const contents = await getProgram(
      `
      scalar X extends string;
      scalar Y extends numeric;
    `
    );

    const result = await render(emitTypescriptInterfaces(contents));
    await assertEqual(
      result,
      `export type X = string;
      export type Y = number;`
    );
  });

  it("emits objects", async () => {
    const program = await getProgram(
      `
      model Foo {
        bar: Bar
      }
      model Bar {
        x: Foo;
        y: {
          x: Foo
        };
      };
      `
    );

    const result = await render(emitTypescriptInterfaces(program));
    await assertEqual(
      result,
      `export interface Foo {
        bar: Bar
      }
      export interface Bar {
        x: Foo;
        y: { x: Foo }
      }`
    );
  });
});
