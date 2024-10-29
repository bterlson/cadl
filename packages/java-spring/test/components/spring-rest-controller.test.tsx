import { d } from "@alloy-js/core/testing";
import { Interface } from "@typespec/compiler";
import { expect, it } from "vitest";
import { RestController } from "../../src/spring/components/index.js";
import { getEmitOutput } from "../utils.js";

it("Creates RestController", async () => {
  const code = `
    @route("/widgets")
    interface Widgets {
      @test @get read(): void;
    }
  `;

  const output = await getEmitOutput(code, (program) => {
    const Foo = program.resolveTypeReference("Widgets")[0]! as Interface;
    return <RestController container={Foo} />;
  });

  expect(output).toBe(d`
      package me.test.code;
      
      import org.springframework.web.bind.annotation.RestController;
      
      @RestController
      public class WidgetsController {
        ${""}
      }
  `);
});
