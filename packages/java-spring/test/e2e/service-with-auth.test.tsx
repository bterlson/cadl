import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import { emit } from "../test-host.js";
import { findEmittedFile } from "../utils.js";

describe("Service with Authentication", async () => {
  const tspCode = `
    @service
    @useAuth(BearerAuth)
    namespace DemoService;
    
    @route("/")
    namespace HelloWorld {
      @get op helloWorld(): string;
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

  it("Emits HelloWorldController", () => {
    const file = findEmittedFile(
      result,
      "io.typespec.generated.controllers.HelloWorldController.java",
    );

    expect(file).toBe(d`
        package io.typespec.generated.controllers;
        
        import org.springframework.web.bind.annotation.RestController;
        import io.typespec.generated.services.HelloWorldService;
        import org.springframework.beans.factory.annotation.Autowired;
        import org.springframework.web.bind.annotation.GetMapping;
        import org.springframework.http.ResponseEntity;
        import org.springframework.http.HttpStatus;
        
        @RestController
        public class HelloWorldController {
          private final HelloWorldService helloworldService;
          
          @Autowired
          public HelloWorldController(HelloWorldService helloworldService) {
            this.helloworldService = helloworldService;
          }
          
          @GetMapping("/")
          public ResponseEntity<String> helloWorld() {
            String returnedBody = helloworldService.helloWorld();
            return new ResponseEntity<>(returnedBody, HttpStatus.valueOf(200));
          }
        }
    `);
  });

  it("Emits Business Logic Interface", () => {
    const file = findEmittedFile(result, "io.typespec.generated.services.HelloWorldService.java");

    expect(file).toBe(d`
        package io.typespec.generated.services;
        
        public interface HelloWorldService {
          String helloWorld();
        }
    `);
  });

  it("Emits Security Config", () => {
    const file = findEmittedFile(result, "io.typespec.generated.auth.AuthConfig.java");

    expect(file).toBe(d`
      package io.typespec.generated.auth;

      import org.springframework.context.annotation.Configuration;
      import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
      import org.springframework.beans.factory.annotation.Autowired;
      import org.springframework.context.annotation.Bean;
      import org.springframework.security.web.SecurityFilterChain;
      import org.springframework.security.config.annotation.web.builders.HttpSecurity;
      import org.springframework.security.config.Customizer;
      import org.springframework.security.oauth2.jwt.JwtDecoder;
      import org.springframework.security.oauth2.jwt.JwtDecoders;
      
      @Configuration
      @EnableWebSecurity
      public class AuthConfig {
        private final ServiceAuth auth;
        
        @Autowired
        public AuthConfig(ServiceAuth auth) {
          this.auth = auth;
        }
        
        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
          http
          .authorizeHttpRequests((authorize) -> authorize
            .anyRequest().authenticated()
          )
          .oauth2ResourceServer((oauth2) -> oauth2
            .jwt(Customizer.withDefaults())
          );
          return http.build();
        }
        
        @Bean
        public JwtDecoder jwtDecoder() {
          return JwtDecoders.fromIssuerLocation(auth.getIssuerUrl());
        }
      }
    `);
  });

  it("Emits Auth Interface", () => {
    const file = findEmittedFile(result, "io.typespec.generated.auth.ServiceAuth.java");

    expect(file).toBe(d`
      package io.typespec.generated.auth;
      
      public interface ServiceAuth {
        String getIssuerUrl();
      }
    `);
  });

  it("Emits Project Configuration Files", () => {
    // Simply call findEmittedFile to check files were emitted
    findEmittedFile(result, "pom.xml");
  });
});
