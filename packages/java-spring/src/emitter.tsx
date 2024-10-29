import * as ay from "@alloy-js/core";
import * as jv from "@alloy-js/java";
import { createJavaNamePolicy, javaUtil, MavenProjectConfig } from "@alloy-js/java";
import { $, EmitContext, getNamespaceFullName, isStdNamespace, Type } from "@typespec/compiler";
import { TypeCollector } from "@typespec/emitter-framework";
import { EnumDeclaration, ModelDeclaration } from "@typespec/emitter-framework/java";
import {
  getAllHttpServices,
  namespace as HttpNamespace,
  HttpOperation,
  HttpService,
  resolveAuthentication,
} from "@typespec/http";
import {
  emitAuth,
  emitOperations,
  emitResponseModels,
  emitServices,
  OperationsGroup,
} from "./common/index.js";
import { NoBody, Response } from "./components/index.js";
import { SpringProject } from "./spring/components/index.js";
import { springFramework } from "./spring/libraries/index.js";

const RestNamespace = "TypeSpec.Rest";

/**
 * This emitter takes a few custom options:
 * - springVersion: The version of spring boot used in the generated code
 * - javaVersion: Version of java maven will compile with, by default it is 8
 * - package: Package that all the java code is outputted to, by default it is 'io.typespec.generated'
 * - groupId: Maven groupId for the project, by default it is 'io.typespec'
 * - artifactId: Maven artifactId for the project, by default it is 'generated'
 * - version: Maven version for the project, by default it is '1.0.0'
 */
export async function $onEmit(context: EmitContext) {
  const options = context.options;
  // Maven config, takes options into emitter
  const projectConfig: MavenProjectConfig = {
    groupId: options?.groupId ?? "io.typespec",
    artifactId: options?.artifactId ?? "generated",
    version: options?.version ?? "1.0.0",
    javaVersion: options?.javaVersion ?? 8,
    build: {
      plugins: [
        {
          groupId: "org.springframework.boot",
          artifactId: "spring-boot-maven-plugin",
        },
      ],
    },
  };

  // Query types needed in program, models, interfaces etc
  const types = queryTypes(context);

  // Get all http services, then collect all routes from services
  const services = getAllHttpServices(context.program);

  // Collect operations from all services into one for further querying
  const serviceOperations: HttpOperation[] = [];
  services.forEach((service) => {
    serviceOperations.push(...((service[0] as HttpService)?.operations ?? []));
  });

  // Collect HttpOperations by container
  const httpOperations = serviceOperations.reduce(
    (acc, op) => {
      const namespaceKey = op.container?.name ?? "";
      if (!acc[namespaceKey]) {
        acc[namespaceKey] = {
          container: op.container,
          operations: [],
        };
      }

      const operations = acc[namespaceKey].operations;
      operations.push(op);
      acc[namespaceKey] = { ...acc[namespaceKey], operations };
      return acc;
    },
    {} as Record<string, OperationsGroup>,
  );

  // Query TypeSpec types that may need to be emitted based on responses from http operations
  serviceOperations.forEach((op) => {
    const responseModels = op.responses.map((res) => res.type);
    responseModels.forEach((model) => {
      if (isNoEmit(model)) {
        return;
      }

      types.dataTypes.push(model);
    });
  });

  // Obtain auth scheme
  // For now we are only obtaining auth on the first service, and are taking the first auth scheme.
  // Currently not supporting multiple auth schemes or per operation overrides.
  const auth = resolveAuthentication(services[0][0] as HttpService);

  // The following is a bit hacky but is required until a better solution is found.
  // Currently if you declare a generic model and use the template type as the type of
  // a property, like the following
  /// model Person<T> {
  //  name: T;
  // }
  // When using the model like Person<string>, when the model is emitted
  // it uses "String" instead of "T". This happens because a different model object is passed
  // to the emitter for each instance, only the instance with the actual declaration will
  // emit correctly, all the other ones always replace the model property type with the passed type (in this case String).
  //
  // What this fix is doing is finding the declaration model instance in the array (which is the first), and moving it to
  // the back of the array to ensure it is the actual one emitted.
  //
  // Can't just emit a model with a name once since currently refkeys depend on the Model instance and not the name. So maybe
  // a solution is to change model refkeys to use the name instead of the model type. Refkeys aren't name based as I
  // believe it could lead to some referential conflicts. For now this hacky fix
  // works but probably needs to be changed
  const modelNameSet = new Set<string>();
  types.dataTypes
    .filter((type) => type.kind === "Model")
    .forEach((type) => {
      modelNameSet.add(type.name);
    });
  modelNameSet.forEach((modelName) => {
    // Get first entry and move to back
    // @ts-expect-error Name might not exist
    const modelIndex = types.dataTypes.findIndex((type) => type?.name === modelName);
    const removedModel = types.dataTypes[modelIndex];
    types.dataTypes.splice(modelIndex, 1);
    types.dataTypes.push(removedModel);
  });

  const outputDir = context.emitterOutputDir;
  return (
    <ay.Output
      externals={[springFramework, javaUtil]}
      basePath={outputDir}
      namePolicy={createJavaNamePolicy()}
    >
      <SpringProject
        name="TestProject"
        mavenProjectConfig={projectConfig}
        useAuth={(auth?.schemes?.length ?? 0) > 0}
        springVersion={options?.springVersion}
      >
        <jv.PackageDirectory package="io.typespec.generated">
          <jv.SourceFile path="MainApplication.java">
            <jv.Annotation type={springFramework.SpringBootApplication} />
            <jv.Class public name="MainApplication">
              <jv.Method public static name="main" parameters={{ args: "String[]" }}>
                {springFramework.SpringApplication}.run(MainApplication.class, args);
              </jv.Method>
            </jv.Class>
          </jv.SourceFile>
          {emitServices(httpOperations)}
          <jv.PackageDirectory package="models">
            {types.dataTypes
              .filter((type) => type.kind === "Model")
              .map((type) => {
                const isErrorModel = $.model.isErrorModel(type);
                return (
                  <jv.SourceFile path={type.name + ".java"}>
                    {isErrorModel && (
                      <jv.Annotation
                        type={springFramework.JsonIgnoreProperties}
                        value={{
                          "": '{"cause", "stackTrace", "localizedMessage", "suppressed"}',
                        }}
                      />
                    )}
                    <ModelDeclaration type={type} />
                  </jv.SourceFile>
                );
              })}
            {types.dataTypes
              .filter((type) => type.kind === "Enum")
              .map((type) => {
                return (
                  <jv.SourceFile path={type.name + ".java"}>
                    <EnumDeclaration type={type} />
                  </jv.SourceFile>
                );
              })}
            <NoBody />
            <Response />
          </jv.PackageDirectory>
          <jv.PackageDirectory package="controllers">
            {emitOperations(httpOperations)}
          </jv.PackageDirectory>
          <jv.PackageDirectory package="responses">
            {emitResponseModels(serviceOperations)}
          </jv.PackageDirectory>
          {emitAuth(auth)}
        </jv.PackageDirectory>
      </SpringProject>
    </ay.Output>
  );
}

function queryTypes(context: EmitContext) {
  const types = new Set<Type>();
  const globalns = context.program.getGlobalNamespaceType();
  const allTypes = new TypeCollector(globalns).flat();
  for (const dataType of [
    ...allTypes.models,
    ...allTypes.unions,
    ...allTypes.enums,
    ...allTypes.scalars,
  ]) {
    if (isNoEmit(dataType)) {
      continue;
    }

    types.add(dataType);
  }

  return { dataTypes: [...types] };
}

/**
 * Check if type shouldn't be emitted. Generally won't emit anything in a standard
 * TypeSpec library, as those are reserved for TypeSpec logic and not actually emitted in code
 *
 * @param type Type to check.
 */
export function isNoEmit(type: Type): boolean {
  // Skip anonymous types
  if (!(type as any).name) {
    return true;
  }

  if ("namespace" in type && type.namespace) {
    if (isStdNamespace(type.namespace)) {
      return true;
    }

    const fullNamespaceName = getNamespaceFullName(type.namespace);

    if ([HttpNamespace].includes(fullNamespaceName)) {
      return true;
    }
    if (fullNamespaceName.startsWith(RestNamespace)) {
      return true;
    }
  }

  return false;
}
