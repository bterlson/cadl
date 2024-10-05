import * as ay from "@alloy-js/core";
import * as jv from "@alloy-js/java";
import { createJavaNamePolicy, javaUtil, MavenProjectConfig } from "@alloy-js/java";
import { $, EmitContext, getNamespaceFullName, isStdNamespace, Type } from "@typespec/compiler";
import { TypeCollector } from "@typespec/emitter-framework";
import { ModelDeclaration } from "@typespec/emitter-framework/java";
import {
  getAllHttpServices,
  namespace as HttpNamespace,
  HttpOperation,
  HttpService,
  resolveAuthentication,
} from "@typespec/http";
import { emitAuth, emitOperations, emitServices, OperationsGroup } from "./common/index.js";
import { emitResponseModels } from "./common/responses.js";
import { NoBody, ResponseWithHeaders } from "./components/index.js";
import { SpringProject } from "./spring/components/index.js";
import { springFramework } from "./spring/libraries/index.js";

const RestNamespace = "TypeSpec.Rest";

const projectConfig: MavenProjectConfig = {
  groupId: "io.typespec",
  artifactId: "generated",
  version: "1.0.0",
  javaVersion: 8,
  build: {
    plugins: [
      {
        groupId: "org.springframework.boot",
        artifactId: "spring-boot-maven-plugin",
      },
    ],
  },
};

export async function $onEmit(context: EmitContext) {
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

  const outputDir = context.emitterOutputDir;
  return (
    <ay.Output
      externals={[springFramework, javaUtil]}
      basePath={outputDir}
      namePolicy={createJavaNamePolicy()}
    >
      <SpringProject name="TestProject" mavenProjectConfig={projectConfig}>
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
            <NoBody />
            <ResponseWithHeaders />
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
    if ([RestNamespace].includes(fullNamespaceName)) {
      return true;
    }
  }

  return false;
}
