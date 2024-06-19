import { ModelProperty, Mutator, Operation, Program } from "@typespec/compiler";
import { getHttpOperation, listHttpOperationsIn } from "@typespec/http";
import { pascalCase } from "change-case";
import { NotImplementedError, UnreachableCodeError } from "./error.js";
import { getHttpParameters } from "./http-utils.js";
import { hasRequiredProperties } from "./model-helpers.js";
import { getOperationFullName } from "./operation-helpers.js";
import { TypeTracker } from "./type-tracker.js";

/**
 * Mutator object to transform operations to REST API requests.
 *
 * @constant
 * @type {Mutator}
 */
export const restOperationMutator: (tracker: TypeTracker) => Mutator = (tracker) => ({
  name: "rest-operation-mutator",
  Operation: {
    mutate(op, clone, program, realm) {
      if (!isHttpOperation(program, op)) {
        return;
      }

      const [httpOperation] = getHttpOperation(program, op);

      // The first thing we need to do, is to rename the operation from the "friendly" name to the actual HTTP method.
      clone.name = httpOperation.verb;
      const parameterModelProperties: ModelProperty[] = [];

      // Let's check the httpOperation to extract the parameters and create the properties for the model.
      const httpQuery = getHttpParameters(httpOperation, "query");
      if (httpQuery.length > 0) {
        const queryParamsProperty = realm.typeFactory.modelProperty(
          "queryParameters",
          realm.typeFactory.model("", httpQuery),
          {
            optional: !hasRequiredProperties(httpQuery),
          }
        );

        realm.addType(queryParamsProperty);
        parameterModelProperties.push(queryParamsProperty);
      }

      const httpHeaders = getHttpParameters(httpOperation, "header");
      if (httpHeaders.length > 0) {
        const headerParamsProperty = realm.typeFactory.modelProperty(
          "headers",
          realm.typeFactory.model("", httpHeaders),
          { optional: !hasRequiredProperties(httpHeaders) }
        );

        realm.addType(headerParamsProperty);
        parameterModelProperties.push(headerParamsProperty);
      }

      const httpBody = httpOperation.parameters.body;
      if (httpBody) {
        if (httpBody.bodyKind === "single") {
          // TODO: probably need to handle content types here.
          // TODO: Need to do anything with containsMetadataAnnotations? Probably not
          const isOptionalBody =
            httpBody.type.kind === "Model" ? !hasRequiredProperties(httpBody.type) : undefined;
          tracker.track("model", httpBody.type);
          const bodyProperty = realm.typeFactory.modelProperty("body", httpBody.type, {
            optional: isOptionalBody,
          });

          realm.addType(bodyProperty);
          parameterModelProperties.push(bodyProperty);
        } else if (httpBody.bodyKind === "multipart") {
          throw new NotImplementedError("Multipart form data is not yet supported.");
        } else {
          // This should be unreachable.
          throw new UnreachableCodeError(`Unsupported body kind: ${(httpBody as any).bodyKind}`);
        }
      }

      // Next, we need to create the request options parameter. Which needs to override the standard shape RequestParameters from the core lib.
      // We'll create a model for this.

      const opFullName = getOperationFullName(op);
      const parameterModelName = pascalCase(`${opFullName}RequestParameters`);
      const operationParameter = realm.typeFactory.model(
        parameterModelName,
        parameterModelProperties
      );

      tracker.track("parameter", operationParameter);

      const isOptionalOptions = !hasRequiredProperties(parameterModelProperties);
      const optionsParameterProp = realm.typeFactory.modelProperty("options", operationParameter, {
        optional: isOptionalOptions,
      });

      const params = realm.typeFactory.model("", [optionsParameterProp]);

      realm.addType(operationParameter);
      realm.remove(clone.parameters);
      clone.parameters = params;
    },
  },
});

function isHttpOperation(program: Program, op: Operation): boolean {
  if (!op.interface && !op.namespace) {
    // Need to know the container to determine if it is an http operation or not
    return false;
  }
  const [httpOperations] = listHttpOperationsIn(program, op.interface ?? op.namespace!);

  return httpOperations.some((httpOperation) => httpOperation.operation === op);
}
