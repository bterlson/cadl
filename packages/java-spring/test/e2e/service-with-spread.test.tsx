import { describe, expect, it } from "vitest";
import { emit } from "../test-host.js";
import { findEmittedFile } from "../utils.js";
import { d } from "@alloy-js/core/testing";


describe("Service with all http decorators", async () => {
  const tspCode = `
    @service
    namespace DemoService;
    model Pet {
      name: string;
      tag?: string;
      age: int32;
    }
    
    model Toy {
      id: int64;
      petId: int64;
      name: string;
    }
    
    @error
    model Error {
      code: int32;
      message: string;
    }
    
    
    model ResponsePage<Item> {
      items: Item[];
      nextLink?: string;
    }
    
    model PetId {
      @path petId: int32;
      @header header: string;
      @query query: string;
    }
    
    @route("/pets")
    namespace Pets {
    
      @delete op delete(...PetId): OkResponse | NoContentResponse | Error;
    
      op list(@query nextLink?: string): ResponsePage<Pet> | Error;
    
      op read(...PetId): Pet | Error;
    
      @post op create(@body pet: Pet): Pet | Error;
    }
    
    @route("/pets/{petId}/toys")
    namespace ListPetToys {
      op list(@path petId: string, @query nameFilter: string): ResponsePage<Toy> | Error;
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

  it("Emits Pet Model", () => {
    const file = findEmittedFile(result, "io.typespec.generated.models.Pet.java");

    expect(file).toBe(d`
      package io.typespec.generated.models;
      
      import java.util.Objects;
      
      
      public final class Pet {
        
        private String name;
        private String tag;
        private Integer age;
        
        public Pet() {
          
        }
        
        public Pet(String name, String tag, Integer age) {
          this.name = Objects.requireNonNull(name, "name cannot be null");
          this.tag = tag;
          this.age = Objects.requireNonNull(age, "age cannot be null");
        }
        
        public String getName() {
          return this.name;
        }
        
        public Pet setName(String name) {
          this.name = name;
          return this;
        }
        
        public String getTag() {
          return this.tag;
        }
        
        public Pet setTag(String tag) {
          this.tag = tag;
          return this;
        }
        
        public Integer getAge() {
          return this.age;
        }
        
        public Pet setAge(Integer age) {
          this.age = age;
          return this;
        }
        
      }
    `)
  })

  it("Emits PetId Model", () => {
    const file = findEmittedFile(result, "io.typespec.generated.models.PetId.java");

    expect(file).toBe(d`
      package io.typespec.generated.models;
      
      import java.util.Objects;
      
      
      public final class PetId {
        
        private Integer petId;
        private String header;
        private String query;
        
        public PetId() {
          
        }
        
        public PetId(Integer petId, String header, String query) {
          this.petId = Objects.requireNonNull(petId, "petId cannot be null");
          this.header = Objects.requireNonNull(header, "header cannot be null");
          this.query = Objects.requireNonNull(query, "query cannot be null");
        }
        
        public Integer getPetId() {
          return this.petId;
        }
        
        public PetId setPetId(Integer petId) {
          this.petId = petId;
          return this;
        }
        
        public String getHeader() {
          return this.header;
        }
        
        public PetId setHeader(String header) {
          this.header = header;
          return this;
        }
        
        public String getQuery() {
          return this.query;
        }
        
        public PetId setQuery(String query) {
          this.query = query;
          return this;
        }
        
      }
    `)
  })

  it("Emits ResponsePage Model", () => {
    const file = findEmittedFile(result, "io.typespec.generated.models.ResponsePage.java");

    expect(file).toBe(d`
      package io.typespec.generated.models;
      
      import java.util.List;
      import java.util.Objects;
      
      
      public final class ResponsePage<Item> {
        
        private List<Item> items;
        private String nextLink;
        
        public ResponsePage() {
          
        }
        
        public ResponsePage(List<Item> items, String nextLink) {
          this.items = Objects.requireNonNull(items, "items cannot be null");
          this.nextLink = nextLink;
        }
        
        public List<Item> getItems() {
          return this.items;
        }
        
        public ResponsePage<Item> setItems(List<Item> items) {
          this.items = items;
          return this;
        }
        
        public String getNextLink() {
          return this.nextLink;
        }
        
        public ResponsePage<Item> setNextLink(String nextLink) {
          this.nextLink = nextLink;
          return this;
        }
        
      }
    `)
  })

  it("Emits Toy Model", () => {
    const file = findEmittedFile(result, "io.typespec.generated.models.Toy.java");

    expect(file).toBe(d`
      package io.typespec.generated.models;
      
      import java.util.Objects;
      
      
      public final class Toy {
        
        private long id;
        private long petId;
        private String name;
        
        public Toy() {
          
        }
        
        public Toy(long id, long petId, String name) {
          this.id = Objects.requireNonNull(id, "id cannot be null");
          this.petId = Objects.requireNonNull(petId, "petId cannot be null");
          this.name = Objects.requireNonNull(name, "name cannot be null");
        }
        
        public long getId() {
          return this.id;
        }
        
        public Toy setId(long id) {
          this.id = id;
          return this;
        }
        
        public long getPetId() {
          return this.petId;
        }
        
        public Toy setPetId(long petId) {
          this.petId = petId;
          return this;
        }
        
        public String getName() {
          return this.name;
        }
        
        public Toy setName(String name) {
          this.name = name;
          return this;
        }
        
      }
    `)
  })

  it("Emits Response Model", () => {
    const file = findEmittedFile(result, "io.typespec.generated.models.Response.java");

    expect(file).toBe(d`
      package io.typespec.generated.models;
      
      import org.springframework.util.MultiValueMap;
      
      public class Response<T> {
        private T response;
        private MultiValueMap<String, String> headers;
        
        public Response(T response, MultiValueMap<String, String> headers) {
          this.response = response;
          this.headers = headers;
        }
        
        public Response(T response) {
          this.response = response;
          this.headers = null;
        }
        
        public Response(MultiValueMap<String, String> headers) {
          this.response = null;
          this.headers = headers;
        }
        
        public T getResponse() {
          return this.response;
        }
        
        public void setResponse(T response) {
          this.response = response;
        }
        
        public MultiValueMap<String, String> getHeaders() {
          return this.headers;
        }
        
        public void setHeaders(MultiValueMap<String, String> headers) {
          this.headers = headers;
        }
      }
    `)
  })

  it("Emits NoBody Model", () => {
    const file = findEmittedFile(result, "io.typespec.generated.models.NoBody.java");

    expect(file).toBe(d`
      package io.typespec.generated.models;
      
      /**
      * Represents a response with no body. Used for custom response classes
      */
      public class NoBody {
        public NoBody() {
          
        }
      }
    `)
  })

  it("Emits Error Model", () => {
    const file = findEmittedFile(result, "io.typespec.generated.models.Error.java");

    expect(file).toBe(d`
      package io.typespec.generated.models;
      
      import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
      import java.util.Objects;
      
      @JsonIgnoreProperties({"cause", "stackTrace", "localizedMessage", "suppressed"})
      public final class Error extends Exception {
        
        private Integer code;
        private String message;
        
        public Error() {
          
        }
        
        public Error(Integer code, String message) {
          this.code = Objects.requireNonNull(code, "code cannot be null");
          this.message = Objects.requireNonNull(message, "message cannot be null");
        }
        
        public Integer getCode() {
          return this.code;
        }
        
        public Error setCode(Integer code) {
          this.code = code;
          return this;
        }
        
        public String getMessage() {
          return this.message;
        }
        
        public Error setMessage(String message) {
          this.message = message;
          return this;
        }
        
      }
    `)
  })

  it("Emits PetsController", () => {
    const file = findEmittedFile(result, "io.typespec.generated.controllers.PetsController.java");

    expect(file).toBe(d`
      package io.typespec.generated.controllers;
      
      import org.springframework.web.bind.annotation.RestController;
      import io.typespec.generated.services.PetsService;
      import org.springframework.beans.factory.annotation.Autowired;
      import org.springframework.web.bind.annotation.DeleteMapping;
      import org.springframework.http.ResponseEntity;
      import org.springframework.web.bind.annotation.RequestHeader;
      import org.springframework.web.bind.annotation.PathVariable;
      import org.springframework.web.bind.annotation.RequestParam;
      import org.springframework.http.HttpStatus;
      import io.typespec.generated.models.Error;
      import org.springframework.web.bind.annotation.GetMapping;
      import io.typespec.generated.models.ResponsePage;
      import io.typespec.generated.models.Pet;
      import org.springframework.web.bind.annotation.PostMapping;
      import org.springframework.web.bind.annotation.RequestBody;
      import io.typespec.generated.responses.DeleteResponse;
      
      @RestController
      public class PetsController {
        private final PetsService petsService;
        
        @Autowired
        public PetsController(PetsService petsService) {
          this.petsService = petsService;
        }
        
        @DeleteMapping("/pets/{petId}")
        public ResponseEntity<?> delete(@RequestHeader("header") String header, @PathVariable("petId") Integer petId, @RequestParam("query") String query) {
          try {
            DeleteResponse returnedBody = petsService.delete(header, petId, query);
            if (returnedBody.getOkResponse() != null) {
              return new ResponseEntity<>(HttpStatus.valueOf(200));
            } else if (returnedBody.getNoContentResponse() != null) {
              return new ResponseEntity<>(HttpStatus.valueOf(204));
            }
            return new ResponseEntity<>(HttpStatus.valueOf(200));
          } catch (Error e) {
            return new ResponseEntity<>(e, HttpStatus.valueOf(500));
          }
        }
        
        @GetMapping("/pets")
        public ResponseEntity<?> list(@RequestParam(name = "nextLink", required = false) String nextLink) {
          try {
            ResponsePage<Pet> returnedBody = petsService.list(nextLink);
            return new ResponseEntity<>(returnedBody, HttpStatus.valueOf(200));
          } catch (Error e) {
            return new ResponseEntity<>(e, HttpStatus.valueOf(500));
          }
        }
        
        @GetMapping("/pets/{petId}")
        public ResponseEntity<?> read(@RequestHeader("header") String header, @PathVariable("petId") Integer petId, @RequestParam("query") String query) {
          try {
            Pet returnedBody = petsService.read(header, petId, query);
            return new ResponseEntity<>(returnedBody, HttpStatus.valueOf(200));
          } catch (Error e) {
            return new ResponseEntity<>(e, HttpStatus.valueOf(500));
          }
        }
        
        @PostMapping("/pets")
        public ResponseEntity<?> create(@RequestBody Pet pet) {
          try {
            Pet returnedBody = petsService.create(pet);
            return new ResponseEntity<>(returnedBody, HttpStatus.valueOf(200));
          } catch (Error e) {
            return new ResponseEntity<>(e, HttpStatus.valueOf(500));
          }
        }
      }
    `);
  });

  it("Emits ListPetToysController", () => {
    const file = findEmittedFile(result, "io.typespec.generated.controllers.ListPetToysController.java");

    expect(file).toBe(d`
      package io.typespec.generated.controllers;
      
      import org.springframework.web.bind.annotation.RestController;
      import io.typespec.generated.services.ListPetToysService;
      import org.springframework.beans.factory.annotation.Autowired;
      import org.springframework.web.bind.annotation.GetMapping;
      import org.springframework.http.ResponseEntity;
      import org.springframework.web.bind.annotation.PathVariable;
      import org.springframework.web.bind.annotation.RequestParam;
      import io.typespec.generated.models.ResponsePage;
      import io.typespec.generated.models.Toy;
      import org.springframework.http.HttpStatus;
      import io.typespec.generated.models.Error;
      
      @RestController
      public class ListPetToysController {
        private final ListPetToysService listpettoysService;
        
        @Autowired
        public ListPetToysController(ListPetToysService listpettoysService) {
          this.listpettoysService = listpettoysService;
        }
        
        @GetMapping("/pets/{petId}/toys")
        public ResponseEntity<?> list(@PathVariable("petId") String petId, @RequestParam("nameFilter") String nameFilter) {
          try {
            ResponsePage<Toy> returnedBody = listpettoysService.list(petId, nameFilter);
            return new ResponseEntity<>(returnedBody, HttpStatus.valueOf(200));
          } catch (Error e) {
            return new ResponseEntity<>(e, HttpStatus.valueOf(500));
          }
        }
      }
    `);
  });

  it("Emits DeleteResponse response", () => {
    const file = findEmittedFile(result, "io.typespec.generated.responses.DeleteResponse.java");

    expect(file).toBe(d`
      package io.typespec.generated.responses;
      
      import io.typespec.generated.models.NoBody;
      
      public class DeleteResponse {
        private NoBody okResponse;
        private NoBody noContentResponse;
        
        public DeleteResponse() {
          
        }
        
        public NoBody getOkResponse() {
          return this.okResponse;
        }
        
        public void setOkResponse(NoBody value) {
          this.okResponse = value;
        }
        
        public NoBody getNoContentResponse() {
          return this.noContentResponse;
        }
        
        public void setNoContentResponse(NoBody value) {
          this.noContentResponse = value;
        }
      }
    `);
  });

  it("Emits PetsService", () => {
    const file = findEmittedFile(result, "io.typespec.generated.services.PetsService.java");

    expect(file).toBe(d`
      package io.typespec.generated.services;
      
      import io.typespec.generated.models.Error;
      import io.typespec.generated.models.ResponsePage;
      import io.typespec.generated.models.Pet;
      import io.typespec.generated.responses.DeleteResponse;
      
      public interface PetsService {
        DeleteResponse delete(String header, Integer petId, String query) throws Error;
        ResponsePage<Pet> list(String nextLink) throws Error;
        Pet read(String header, Integer petId, String query) throws Error;
        Pet create(Pet pet) throws Error;
      }
    `);
  });

  it("Emits ListPetToysService", () => {
    const file = findEmittedFile(result, "io.typespec.generated.services.ListPetToysService.java");

    expect(file).toBe(d`
      package io.typespec.generated.services;
      
      import io.typespec.generated.models.Error;
      import io.typespec.generated.models.ResponsePage;
      import io.typespec.generated.models.Toy;
      
      public interface ListPetToysService {
        ResponsePage<Toy> list(String petId, String nameFilter) throws Error;
      }
    `);
  });

  it("Emits Project Configuration Files", () => {
    // Simply call findEmittedFile to check files were emitted
    findEmittedFile(result, "pom.xml");
  });
})
