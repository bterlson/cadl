import { describe, expect, it } from "vitest";
import { emit } from "../test-host.js";
import { findEmittedFile } from "../utils.js";
import { d } from "@alloy-js/core/testing";


describe("Service with generics", async () => {
  const tspCode = `
    @service
    namespace DemoService;
    
    @route("/people")
    namespace People {
      model Person<T> {
        id: int32;
        name: string;
        age: int32;
        special: T;
      }
      
      @post op createPerson(@bodyRoot newPerson: Person<string>): Person<string>;
      @get op getPersonWithString(@path id: int32): Person<int32>;
      @get op listPeople(): Person<string>[];
   
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
      
      
      public final class Person<T> {
        
        private Integer id;
        private String name;
        private Integer age;
        private T special;
        
        public Person() {
          
        }
        
        public Person(Integer id, String name, Integer age, T special) {
          this.id = Objects.requireNonNull(id, "id cannot be null");
          this.name = Objects.requireNonNull(name, "name cannot be null");
          this.age = Objects.requireNonNull(age, "age cannot be null");
          this.special = Objects.requireNonNull(special, "special cannot be null");
        }
        
        public Integer getId() {
          return this.id;
        }
        
        public Person<T> setId(Integer id) {
          this.id = id;
          return this;
        }
        
        public String getName() {
          return this.name;
        }
        
        public Person<T> setName(String name) {
          this.name = name;
          return this;
        }
        
        public Integer getAge() {
          return this.age;
        }
        
        public Person<T> setAge(Integer age) {
          this.age = age;
          return this;
        }
        
        public T getSpecial() {
          return this.special;
        }
        
        public Person<T> setSpecial(T special) {
          this.special = special;
          return this;
        }
        
      }
    `)
  })

  it("Emits PeopleController", () => {
    const file = findEmittedFile(result, "io.typespec.generated.controllers.PeopleController.java");

    expect(file).toBe(d`
      package io.typespec.generated.controllers;
      
      import org.springframework.web.bind.annotation.RestController;
      import io.typespec.generated.services.PeopleService;
      import org.springframework.beans.factory.annotation.Autowired;
      import org.springframework.web.bind.annotation.PostMapping;
      import org.springframework.http.ResponseEntity;
      import io.typespec.generated.models.Person;
      import org.springframework.web.bind.annotation.RequestBody;
      import org.springframework.http.HttpStatus;
      import org.springframework.web.bind.annotation.GetMapping;
      import io.typespec.generated.models.Person;
      import org.springframework.web.bind.annotation.PathVariable;
      import java.util.List;
      
      @RestController
      public class PeopleController {
        private final PeopleService peopleService;
        
        @Autowired
        public PeopleController(PeopleService peopleService) {
          this.peopleService = peopleService;
        }
        
        @PostMapping("/people")
        public ResponseEntity<Person<String>> createPerson(@RequestBody Person<String> newPerson) {
          Person<String> returnedBody = peopleService.createPerson(newPerson);
          return new ResponseEntity<>(returnedBody, HttpStatus.valueOf(200));
        }
        
        @GetMapping("/people/{id}")
        public ResponseEntity<Person<Integer>> getPersonWithString(@PathVariable("id") Integer id) {
          Person<Integer> returnedBody = peopleService.getPersonWithString(id);
          return new ResponseEntity<>(returnedBody, HttpStatus.valueOf(200));
        }
        
        @GetMapping("/people")
        public ResponseEntity<List<Person<String>>> listPeople() {
          List<Person<String>> returnedBody = peopleService.listPeople();
          return new ResponseEntity<>(returnedBody, HttpStatus.valueOf(200));
        }
      }
    `);
  });

  it("Emits Project Configuration Files", () => {
    // Simply call findEmittedFile to check files were emitted
    findEmittedFile(result, "pom.xml");
  });
})
