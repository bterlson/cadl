import { d } from "@alloy-js/core/testing";
import * as jv from "@alloy-js/java";
import { Operation } from "@typespec/compiler";
import { $ } from "@typespec/compiler/typekit";
import { expect, it } from "vitest";
import { SpringServiceEndpoint } from "../../src/spring/components/spring-service-endpoint.js";
import { getEmitOutput } from "../utils.js";

it("Creates get service", async () => {
  const code = `
    @route("/people")
    @get op listPeople(): string;
  `;

  const output = await getEmitOutput(code, (program) => {
    const Foo = program.resolveTypeReference("listPeople")[0]! as Operation;
    const Bar = $.httpOperation.get(Foo);
    return (
      <>
        <jv.Class name={"TestClass"}>
          <SpringServiceEndpoint op={Bar} />
        </jv.Class>
      </>
    );
  });

  expect(output).toBe(d`
      package me.test.code;
      
      import org.springframework.web.bind.annotation.GetMapping;
      import org.springframework.http.ResponseEntity;
      
      class TestClass {
        @GetMapping("/people")
        public ResponseEntity<String> listPeople();
      }
  `);
});

it("Creates put service", async () => {
  const code = `
    @route("/people")
    @put op listPeople(): string;
  `;

  const output = await getEmitOutput(code, (program) => {
    const Foo = program.resolveTypeReference("listPeople")[0]! as Operation;
    const Bar = $.httpOperation.get(Foo);
    return (
      <>
        <jv.Class name={"TestClass"}>
          <SpringServiceEndpoint op={Bar} />
        </jv.Class>
      </>
    );
  });

  expect(output).toBe(d`
      package me.test.code;
      
      import org.springframework.web.bind.annotation.PutMapping;
      import org.springframework.http.ResponseEntity;
      
      class TestClass {
        @PutMapping("/people")
        public ResponseEntity<String> listPeople();
      }
  `);
});

it("Creates post service", async () => {
  const code = `
    @route("/people")
    @post op listPeople(): string;
  `;

  const output = await getEmitOutput(code, (program) => {
    const Foo = program.resolveTypeReference("listPeople")[0]! as Operation;
    const Bar = $.httpOperation.get(Foo);
    return (
      <>
        <jv.Class name={"TestClass"}>
          <SpringServiceEndpoint op={Bar} />
        </jv.Class>
      </>
    );
  });

  expect(output).toBe(d`
      package me.test.code;
      
      import org.springframework.web.bind.annotation.PostMapping;
      import org.springframework.http.ResponseEntity;
      
      class TestClass {
        @PostMapping("/people")
        public ResponseEntity<String> listPeople();
      }
  `);
});

it("Creates delete service", async () => {
  const code = `
    @route("/people")
    @delete op listPeople(): void;
  `;

  const output = await getEmitOutput(code, (program) => {
    const Foo = program.resolveTypeReference("listPeople")[0]! as Operation;
    const Bar = $.httpOperation.get(Foo);
    return (
      <>
        <jv.Class name={"TestClass"}>
          <SpringServiceEndpoint op={Bar} />
        </jv.Class>
      </>
    );
  });

  expect(output).toBe(d`
      package me.test.code;
      
      import org.springframework.web.bind.annotation.DeleteMapping;
      import org.springframework.http.ResponseEntity;
      
      class TestClass {
        @DeleteMapping("/people")
        public ResponseEntity<Void> listPeople();
      }
  `);
});

it("Creates service with body parameter", async () => {
  const code = `
    @route("/people")
    op listPeople(@body name: string): string;
  `;

  const output = await getEmitOutput(code, (program) => {
    const Foo = program.resolveTypeReference("listPeople")[0]! as Operation;
    const Bar = $.httpOperation.get(Foo);
    return (
      <>
        <jv.Class name={"TestClass"}>
          <SpringServiceEndpoint op={Bar} />
        </jv.Class>
      </>
    );
  });

  expect(output).toBe(d`
      package me.test.code;
      
      import org.springframework.web.bind.annotation.PostMapping;
      import org.springframework.http.ResponseEntity;
      import org.springframework.web.bind.annotation.RequestBody;

      class TestClass {
        @PostMapping("/people")
        public ResponseEntity<String> listPeople(@RequestBody String name);
      }
  `);
});

it("Creates service with header parameter", async () => {
  const code = `
    @route("/people")
    op listPeople(@header name: string): string;
  `;

  const output = await getEmitOutput(code, (program) => {
    const Foo = program.resolveTypeReference("listPeople")[0]! as Operation;
    const Bar = $.httpOperation.get(Foo);
    return (
      <>
        <jv.Class name={"TestClass"}>
          <SpringServiceEndpoint op={Bar} />
        </jv.Class>
      </>
    );
  });

  expect(output).toBe(d`
      package me.test.code;
      
      import org.springframework.web.bind.annotation.GetMapping;
      import org.springframework.http.ResponseEntity;
      import org.springframework.web.bind.annotation.RequestHeader;
      
      class TestClass {
        @GetMapping("/people")
        public ResponseEntity<String> listPeople(@RequestHeader("name") String name);
      }
  `);
});

it("Creates service with path parameter", async () => {
  const code = `
    @route("/people")
    op listPeople(@path name: string): void;
  `;

  const output = await getEmitOutput(code, (program) => {
    const Foo = program.resolveTypeReference("listPeople")[0]! as Operation;
    const Bar = $.httpOperation.get(Foo);
    return (
      <>
        <jv.Class name={"TestClass"}>
          <SpringServiceEndpoint op={Bar} />
        </jv.Class>
      </>
    );
  });

  expect(output).toBe(d`
      package me.test.code;
      
      import org.springframework.web.bind.annotation.GetMapping;
      import org.springframework.http.ResponseEntity;
      import org.springframework.web.bind.annotation.PathVariable;
      
      class TestClass {
        @GetMapping("/people/{name}")
        public ResponseEntity<Void> listPeople(@PathVariable("name") String name);
      }
  `);
});

it("Creates service with path parameter from the path", async () => {
  const code = `
    @route("/people/{name}")
    op listPeople(name: string): void;
  `;

  const output = await getEmitOutput(code, (program) => {
    const Foo = program.resolveTypeReference("listPeople")[0]! as Operation;

    const Bar = $.httpOperation.get(Foo);
    return (
      <>
        <jv.Class name={"TestClass"}>
          <SpringServiceEndpoint op={Bar} />
        </jv.Class>
      </>
    );
  });

  expect(output).toBe(d`
      package me.test.code;
      
      import org.springframework.web.bind.annotation.GetMapping;
      import org.springframework.http.ResponseEntity;
      import org.springframework.web.bind.annotation.PathVariable;

      class TestClass {
        @GetMapping("/people/{name}")
        public ResponseEntity<Void> listPeople(@PathVariable String name);
      }
  `);
});

it("Creates service with query parameter", async () => {
  const code = `
    @route("/people")
    op listPeople(@query name: string): void;
  `;

  const output = await getEmitOutput(code, (program) => {
    const Foo = program.resolveTypeReference("listPeople")[0]! as Operation;
    const Bar = $.httpOperation.get(Foo);
    return (
      <>
        <jv.Class name={"TestClass"}>
          <SpringServiceEndpoint op={Bar} />
        </jv.Class>
      </>
    );
  });

  expect(output).toBe(d`
      package me.test.code;
      
      import org.springframework.web.bind.annotation.GetMapping;
      import org.springframework.http.ResponseEntity;
      import org.springframework.web.bind.annotation.RequestParam;

      class TestClass {
        @GetMapping("/people")
        public ResponseEntity<Void> listPeople(@RequestParam("name") String name);
      }
  `);
});
