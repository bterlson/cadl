import { describe, expect, it } from "vitest";
import { emit } from "../test-host.js";
import { findEmittedFile } from "../utils.js";
import { d } from "@alloy-js/core/testing";


describe("Service with all http decorators", async () => {
  const tspCode = `
    @service
    namespace DemoService;
    
    @route("/people")
    namespace People {
      model Person {
        id: int32;
        name: string;
        age: int32;
      }
    
      @get op listPeople(@header Authorization: string, @query name: string): Person[];
    
      @post op createPerson(@body newPerson: Person): Person;
    
      @put op updatePerson(@path id: int32, @body updatedPerson: Person): Person;
    
      @delete op deletePerson(@path id: int32): void;
    
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
        
        private Integer id;
        private String name;
        private Integer age;
        
        public Person() {
          
        }
        
        public Person(Integer id, String name, Integer age) {
          this.id = Objects.requireNonNull(id, "id cannot be null");
          this.name = Objects.requireNonNull(name, "name cannot be null");
          this.age = Objects.requireNonNull(age, "age cannot be null");
        }
        
        public Integer getId() {
          return this.id;
        }
        
        public Person setId(Integer id) {
          this.id = id;
          return this;
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
    `)
  })

  it("Emits PeopleController", () => {
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
      import org.springframework.web.bind.annotation.RequestHeader;
      import org.springframework.web.bind.annotation.RequestParam;
      import org.springframework.http.HttpStatus;
      import org.springframework.web.bind.annotation.PostMapping;
      import org.springframework.web.bind.annotation.RequestBody;
      import org.springframework.web.bind.annotation.PutMapping;
      import org.springframework.web.bind.annotation.PathVariable;
      import org.springframework.web.bind.annotation.DeleteMapping;
      
      @RestController
      public class PeopleController {
        private final PeopleService peopleService;
        
        @Autowired
        public PeopleController(PeopleService peopleService) {
          this.peopleService = peopleService;
        }
        
        @GetMapping("/people")
        public ResponseEntity<List<Person>> listPeople(@RequestHeader("authorization") String Authorization, @RequestParam("name") String name) {
          List<Person> returnedBody = peopleService.listPeople(Authorization, name);
          return new ResponseEntity<>(returnedBody, HttpStatus.valueOf(200));
        }
        
        @PostMapping("/people")
        public ResponseEntity<Person> createPerson(@RequestBody Person newPerson) {
          Person returnedBody = peopleService.createPerson(newPerson);
          return new ResponseEntity<>(returnedBody, HttpStatus.valueOf(200));
        }
        
        @PutMapping("/people/{id}")
        public ResponseEntity<Person> updatePerson(@RequestBody Person updatedPerson, @PathVariable("id") Integer id) {
          Person returnedBody = peopleService.updatePerson(updatedPerson, id);
          return new ResponseEntity<>(returnedBody, HttpStatus.valueOf(200));
        }
        
        @DeleteMapping("/people/{id}")
        public ResponseEntity<Void> deletePerson(@PathVariable("id") Integer id) {
          peopleService.deletePerson(id);
          return new ResponseEntity<>(HttpStatus.valueOf(204));
        }
      }
    `);
  });

  it("Emits PeopleService", () => {
    const file = findEmittedFile(result, "io.typespec.generated.services.PeopleService.java");

    expect(file).toBe(d`
      package io.typespec.generated.services;
      
      import java.util.List;
      import io.typespec.generated.models.Person;
      
      public interface PeopleService {
        List<Person> listPeople(String authorization, String name);
        Person createPerson(Person newPerson);
        Person updatePerson(Person updatedPerson, Integer id);
        void deletePerson(Integer id);
      }
    `);
  });

  it("Emits Project Configuration Files", () => {
    // Simply call findEmittedFile to check files were emitted
    findEmittedFile(result, "pom.xml");
  });
})
