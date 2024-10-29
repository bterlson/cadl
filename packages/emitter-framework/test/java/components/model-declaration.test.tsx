import { d } from "@alloy-js/core/testing";
import { PackageDirectory, SourceFile } from "@alloy-js/java/stc";
import { Model, Namespace } from "@typespec/compiler";
import { describe, expect, it } from "vitest";
import { ModelDeclaration } from "../../../src/java/index.js";
import { getEmitOutput, getMultiEmitOutput } from "../utils.js";

describe("TypeSpec Model Declaration", () => {
  it("Takes a model type parameter", async () => {
    const code = `
        model Widget {
          id: string;
          weight: int32;
          color: string;
        }
    `;

    const output = await getEmitOutput(code, (program) => {
      const Foo = program.resolveTypeReference("Widget")[0]! as Model;
      return <ModelDeclaration type={Foo} />;
    });

    expect(output).toBe(d`
      package me.test.code;
      
      import java.util.Objects;
      
      public final class Widget {
        
        private String id;
        private Integer weight;
        private String color;
        
        public Widget() {
          
        }
        
        public Widget(String id, Integer weight, String color) {
          this.id = Objects.requireNonNull(id, "id cannot be null");
          this.weight = Objects.requireNonNull(weight, "weight cannot be null");
          this.color = Objects.requireNonNull(color, "color cannot be null");
        }
        
        public String getId() {
          return this.id;
        }
        
        public Widget setId(String id) {
          this.id = id;
          return this;
        }
        
        public Integer getWeight() {
          return this.weight;
        }
        
        public Widget setWeight(Integer weight) {
          this.weight = weight;
          return this;
        }
        
        public String getColor() {
          return this.color;
        }
        
        public Widget setColor(String color) {
          this.color = color;
          return this;
        }
        
      }
    `);
  });

  it("Takes a generic model type parameter", async () => {
    const code = `
        namespace DemoService;
        model Widget<T> {
          id: string;
          item: T;
        }
    `;

    const output = await getEmitOutput(code, (program) => {
      const [namespace] = program.resolveTypeReference("DemoService");
      const Foo = Array.from((namespace as Namespace).models.values())[0];
      return <ModelDeclaration type={Foo} />;
    });

    expect(output).toBe(d`
      package me.test.code;
      
      import java.util.Objects;
      
      public final class Widget<T> {
        
        private String id;
        private T item;
        
        public Widget() {
          
        }
        
        public Widget(String id, T item) {
          this.id = Objects.requireNonNull(id, "id cannot be null");
          this.item = Objects.requireNonNull(item, "item cannot be null");
        }
        
        public String getId() {
          return this.id;
        }
        
        public Widget<T> setId(String id) {
          this.id = id;
          return this;
        }
        
        public T getItem() {
          return this.item;
        }
        
        public Widget<T> setItem(T item) {
          this.item = item;
          return this;
        }
        
      }
    `);
  });

  it("Extends a model", async () => {
    const code = `
        namespace DemoService;
        model BaseModel {
          value: string;
        }
        
        model Widget extends BaseModel {
          id: string;
        }
    `;

    const output = await getMultiEmitOutput(code, (program) => {
      const [namespace] = program.resolveTypeReference("DemoService");
      const Widget = Array.from((namespace as Namespace).models.values())[1];
      return [
        SourceFile({ path: "Test.java" }).children(() => {
          return <ModelDeclaration type={Widget} />;
        }),
        PackageDirectory({ package: "base" }).children(
          SourceFile({ path: "Test2.java" }).children(() => {
            return <ModelDeclaration type={Widget.baseModel!} />;
          }),
        ),
      ];
    });

    expect(output).toBe(d`
      package me.test.code;
      
      import java.util.Objects;
      import me.test.code.base.BaseModel;
      
      public final class Widget extends BaseModel {
        
        private String id;
        
        public Widget() {
          
        }
        
        public Widget(String id) {
          this.id = Objects.requireNonNull(id, "id cannot be null");
        }
        
        public String getId() {
          return this.id;
        }
        
        public Widget setId(String id) {
          this.id = id;
          return this;
        }
        
      }
    `);
  });

  it("Extends a generic model", async () => {
    const code = `
        namespace DemoService;
        model BaseModel<T> {
          value: T;
        }
        
        model Widget extends BaseModel<string> {
          id: string;
        }
    `;

    const output = await getMultiEmitOutput(code, (program) => {
      const [namespace] = program.resolveTypeReference("DemoService");
      const Widget = Array.from((namespace as Namespace).models.values())[1];
      return [
        SourceFile({ path: "Test.java" }).children(() => {
          return <ModelDeclaration type={Widget} />;
        }),
        PackageDirectory({ package: "base" }).children(
          SourceFile({ path: "Test2.java" }).children(() => {
            return <ModelDeclaration type={Widget.baseModel!} />;
          }),
        ),
      ];
    });

    expect(output).toBe(d`
      package me.test.code;
      
      import java.util.Objects;
      import me.test.code.base.BaseModel;
      
      public final class Widget extends BaseModel<String> {
        
        private String id;
        
        public Widget() {
          
        }
        
        public Widget(String id) {
          this.id = Objects.requireNonNull(id, "id cannot be null");
        }
        
        public String getId() {
          return this.id;
        }
        
        public Widget setId(String id) {
          this.id = id;
          return this;
        }
        
      }
    `);
  });

  it("Extends a generic model and passes generic type", async () => {
    const code = `
        namespace DemoService;
        model BaseModel<T> {
          value: T;
        }
        
        model Widget<T> extends BaseModel<T> {
          id: T;
        }
    `;

    const output = await getMultiEmitOutput(code, (program) => {
      const [namespace] = program.resolveTypeReference("DemoService");
      const Widget = Array.from((namespace as Namespace).models.values())[1];
      return [
        SourceFile({ path: "Test.java" }).children(() => {
          return <ModelDeclaration type={Widget} />;
        }),
        PackageDirectory({ package: "base" }).children(
          SourceFile({ path: "Test2.java" }).children(() => {
            return <ModelDeclaration type={Widget.baseModel!} />;
          }),
        ),
      ];
    });

    expect(output).toBe(d`
      package me.test.code;
      
      import java.util.Objects;
      import me.test.code.base.BaseModel;
      
      public final class Widget<T> extends BaseModel<T> {
        
        private T id;
        
        public Widget() {
          
        }
        
        public Widget(T id) {
          this.id = Objects.requireNonNull(id, "id cannot be null");
        }
        
        public T getId() {
          return this.id;
        }
        
        public Widget<T> setId(T id) {
          this.id = id;
          return this;
        }
        
      }
    `);
  });
});
