import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import { emit } from "../test-host.js";
import { findEmittedFile } from "../utils.js";

describe("Basic service", async () => {
  const tspCode = `
    @service
    namespace DemoService;
    
    @route("/people")
    namespace People {
      model Person {
        name: string;
        age: int32;
      }
    
      @get op listPeople(): Person[];
    }
  `;

  const result = await emit(tspCode);

  it("Emits main spring application class", () => {
    const file = findEmittedFile(result, "io.typespec.generated.MainApplication.java");

    expect(file).toBe(d`
      package io.typespec.generated;

      import org.springframework.boot.autoconfigure.SpringBootApplication;
      import org.springframework.boot.SpringApplication;

      @SpringBootApplication
      public class MainApplication {
        public static void main(String[] args) {
          SpringApplication.run(MainApplication.class, args);
        }
      }
    `);
  });

  it("Emits Person Model", () => {
    const file = findEmittedFile(result, "io.typespec.generated.models.Person.java");

    expect(file).toBe(d`
      package io.typespec.generated.models;
      
      import java.util.Objects;
      
      
      public final class Person {
        
        private String name;
        private Integer age;
        
        public Person() {
          
        }
        
        public Person(String name, Integer age) {
          this.name = Objects.requireNonNull(name, "name cannot be null");
          this.age = Objects.requireNonNull(age, "age cannot be null");
        }
        
        public String getName() {
          return this.name;
        }
        
        public Person setName(String name) {
          this.name = name;
          return this;
        }
        
        public Integer getAge() {
          return this.age;
        }
        
        public Person setAge(Integer age) {
          this.age = age;
          return this;
        }
        
      }
    `);
  });

  it("Emits PersonController", () => {
    const file = findEmittedFile(result, "io.typespec.generated.controllers.PeopleController.java");

    expect(file).toBe(d`
      package io.typespec.generated.controllers;
      
      import org.springframework.web.bind.annotation.RestController;
      import io.typespec.generated.services.PeopleService;
      import org.springframework.beans.factory.annotation.Autowired;
      import org.springframework.web.bind.annotation.GetMapping;
      import org.springframework.http.ResponseEntity;
      import java.util.List;
      import io.typespec.generated.models.Person;
      import org.springframework.http.HttpStatus;
      
      @RestController
      public class PeopleController {
        private final PeopleService peopleService;
        
        @Autowired
        public PeopleController(PeopleService peopleService) {
          this.peopleService = peopleService;
        }
        
        @GetMapping("/people")
        public ResponseEntity<List<Person>> listPeople() {
          List<Person> returnedBody = peopleService.listPeople();
          return new ResponseEntity<>(returnedBody, HttpStatus.valueOf(200));
        }
      }
    `);
  });

  it("Emits Business Logic Interface", () => {
    const file = findEmittedFile(result, "io.typespec.generated.services.PeopleService.java");

    expect(file).toBe(d`
      package io.typespec.generated.services;
      
      import java.util.List;
      import io.typespec.generated.models.Person;
      
      public interface PeopleService {
        List<Person> listPeople();
      }
    `);
  });

  it("Emits Project Configuration Files", () => {
    // Simply call findEmittedFile to check files were emitted
    findEmittedFile(result, "pom.xml");
  });
});
