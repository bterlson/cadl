import { d } from "@alloy-js/core/testing";
import { Enum } from "@typespec/compiler";
import { describe, expect, it } from "vitest";
import { EnumDeclaration } from "../../../src/java/index.js";
import { getEmitOutput } from "../utils.js";

describe("Typespec Enum Declaration", () => {
  it("Takes enum with no custom values", async () => {
    const code = `
        enum Direction {
          NORTH,
          EAST,
          SOUTH,
          WEST,
        }
    `;

    const output = await getEmitOutput(code, (program) => {
      const Foo = program.resolveTypeReference("Direction")[0]! as Enum;
      return <EnumDeclaration type={Foo} />;
    });

    expect(output).toBe(d`
      package me.test.code;

      enum Direction {
        NORTH,
        EAST,
        SOUTH,
        WEST
      }
    `);
  });

  it("Takes enum with custom string values", async () => {
    const code = `
        enum Direction {
          NORTH: "north",
          EAST: "east",
          SOUTH: "south",
          WEST: "west",
        }
    `;

    const output = await getEmitOutput(code, (program) => {
      const Foo = program.resolveTypeReference("Direction")[0]! as Enum;
      return <EnumDeclaration type={Foo} />;
    });

    expect(output).toBe(d`
      package me.test.code;
      
      enum Direction {
        NORTH("north"),
        EAST("east"),
        SOUTH("south"),
        WEST("west");
        
        private String value;
        
        public String getValue() {
          return this.value;
        }
        
        Direction(String value) {
          this.value = value;
        }
      }
    `);
  });

  it("Takes enum with custom number values", async () => {
    const code = `
        enum Foo {
          ONE: 1,
          TEN: 10,
          HUNDRED: 100,
          THOUSAND: 1000,
        }
    `;

    const output = await getEmitOutput(code, (program) => {
      const Foo = program.resolveTypeReference("Foo")[0]! as Enum;
      return <EnumDeclaration type={Foo} />;
    });

    expect(output).toBe(d`
      package me.test.code;
      
      enum Foo {
        ONE(1),
        TEN(10),
        HUNDRED(100),
        THOUSAND(1000);
        
        private int value;
        
        public int getValue() {
          return this.value;
        }
        
        Foo(int value) {
          this.value = value;
        }
      }
    `);
  });

  it("Takes enum with some custom values", async () => {
    const code = `
        enum Foo {
          ONE,
          TEN,
          HUNDRED: 100,
          THOUSAND: 1000,
        }
    `;

    const output = await getEmitOutput(code, (program) => {
      const Foo = program.resolveTypeReference("Foo")[0]! as Enum;
      return <EnumDeclaration type={Foo} />;
    });

    expect(output).toBe(d`
      package me.test.code;
      
      enum Foo {
        ONE(null),
        TEN(null),
        HUNDRED(100),
        THOUSAND(1000);
        
        private int value;
        
        public int getValue() {
          return this.value;
        }
        
        Foo(int value) {
          this.value = value;
        }
      }
    `);
  });
});
