import { createLibrary } from "@alloy-js/java";

// Define library methods for the spring framework
export const springFramework = createLibrary({
  groupId: "org.springframework",
  artifactId: "spring-framework",
  version: "5.3.9",
  descriptor: {
    "org.springframework.boot": ["SpringApplication"],
    "org.springframework.boot.autoconfigure": ["SpringBootApplication"],
    "org.springframework.web.bind.annotation": [
      "GetMapping",
      "PutMapping",
      "PostMapping",
      "DeleteMapping",
      "PatchMapping",
      "RestController",
      "RequestMapping",
      "RequestBody",
      "PathVariable",
      "RequestHeader",
      "RequestParam",
    ],
    "org.springframework.beans.factory.annotation": ["Autowired"],
    "org.springframework.context.annotation": ["Bean", "Configuration"],
    "org.springframework.security.config": ["Customizer"],
    "org.springframework.security.config.annotation.web.builders": ["HttpSecurity"],
    "org.springframework.security.config.annotation.web.configuration": ["EnableWebSecurity"],
    "org.springframework.security.oauth2.jwt": ["JwtDecoder", "JwtDecoders"],
    "org.springframework.security.web": ["SecurityFilterChain"],
    "org.springframework.http": ["HttpStatus", "ResponseEntity"],
    "org.springframework.util": ["MultiValueMap"],
    "com.fasterxml.jackson.annotation": ["JsonIgnoreProperties"],
  },
});
