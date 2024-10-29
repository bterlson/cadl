# Java Spring Server Side Code Emitter

TypeSpec service code generator for Java. Utilises the Spring Boot framework
in the emitted code.

## Setting up Emitter
Currently this emitter is not available on npm so you will have to build it and its dependencies first.

Ensure you have run `pnpm install` then you will need to build the following packages in this repository:
- `@typespec/compiler`
- `@typespec/http`
- `@typespec/rest`
- `@typespec/emitter-framework`

Finally run `pnpm build` to build the emitter.

## Running Emitter
To run the emitter using the sample file you can run
```bash
tsp compile sample/main.tsp --emit java-spring
```

### Options
You can optionally pass some options to the emitter to configure the emitted service. See the following
`tspconfig.yaml` file for an overview of options and their defaults.

```yaml
options:
  java-spring:
    # The spring version used in generated code
    springVersion: 3.3.3
    # The java version declared in maven config for compiling
    javaVersion: 11
    # The package all java code is emitted to
    package: io.typespec.generated
    # The maven groupId for the generated project
    groupId: io.typespec
    # The maven artifactId for the generated project
    artifactId: generated
    # The maven version for the generated project
    version: 1.0.0
```
