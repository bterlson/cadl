import { Model, ModelProperty, Mutator, Realm } from "@typespec/compiler";
import {
  HttpOperationBody,
  HttpOperationMultipartBody,
  HttpStatusCodeRange,
  getHttpOperation,
} from "@typespec/http";
import { pascalCase } from "change-case";
import { NotImplementedError, UnreachableCodeError } from "./error.js";
import { hasRequiredProperties } from "./model-helpers.js";
import { getOperationFullName } from "./operation-helpers.js";
import { TypeTracker } from "./type-tracker.js";

/**
 * Mutator object to transform an operation result to REST API response.
 *
 * @constant
 * @type {Mutator}
 */
export const restResponseMutator: (tracker: TypeTracker) => Mutator = (tracker) => ({
  name: "rest-operation-response-mutator",
  Operation: {
    mutate(op, clone, program, realm) {
      // This mutator needs to do the following:
      // For each return type it needs to create a new model that represents the response.
      // There operation may result in one or more status codes
      // Each status code may have different response bodies based on content-type

      // We need to figure out which responses need to be created
      const [httpOperation] = getHttpOperation(program, op);

      const responseModels: Model[] = [];
      for (const httpResponse of httpOperation.responses) {
        // Here we have responses for a specific status code
        for (const response of httpResponse.responses) {
          // Here we have a response for a specific content type
          // We can now create a model based on the response body.
          // Start by creating the new return type model.

          // Note: Typespec makes content-type case insensitive
          let contentTypes = response.body?.contentTypes;

          if (!contentTypes || contentTypes.length === 0) {
            contentTypes = ["application/json"];
          }

          // Here we know that the current response body shape corresponds to the contentTypes we extracted above
          // This means we need to create a single model where the content-type is a union of all the content types

          // Lets create the new model properties
          const responseProperties: ModelProperty[] = [];

          const statusCodeProperty = getRlcStatusCodeProperty(realm, httpResponse.statusCodes);
          responseProperties.push(statusCodeProperty);

          if (response.headers) {
            const headersProperty = getRlcResponseHeaderProperty(
              realm,
              response.headers,
              contentTypes
            );
            responseProperties.push(headersProperty);
          }

          if (response.body) {
            const bodyProperty = getRlcResponseBodyProperty(realm, response.body);
            responseProperties.push(bodyProperty);
          }

          // Get the name for our new model
          const fullOperationName = getOperationFullName(httpOperation.operation);
          const statusCodePart = getRlcStatusCodeName(httpResponse.statusCodes);
          const contentTypePart = contentTypes
            .filter((c) => c !== "application/json")
            .map((contentType) => pascalCase(contentType))
            .join("");

          const responseModelName = `${fullOperationName}${statusCodePart}${contentTypePart}Response`;
          const responseModel = realm.typeFactory.model(responseModelName, responseProperties);
          realm.addType(responseModel);

          // We need to track this for emitting
          tracker.track("response", responseModel);
          responseModels.push(responseModel);
        }
      }

      if (responseModels.length === 0) {
        throw new NotImplementedError("Handling operation with no responses");
      }

      realm.remove(clone.returnType);

      if (responseModels.length === 1) {
        clone.returnType = responseModels[0];
      } else {
        clone.returnType = realm.typeFactory.union(responseModels);
      }
    },
  },
});

function getRlcStatusCodeName(statusCodes: number | HttpStatusCodeRange | "*") {
  if (typeof statusCodes === "number") {
    return String(statusCodes);
  }

  if (statusCodes === "*") {
    return "Default";
  }

  throw new NotImplementedError("Handling StatusCodeRange is not implemented yet.");
}

function getRlcResponseBodyProperty(
  realm: Realm,
  body: HttpOperationBody | HttpOperationMultipartBody
): ModelProperty {
  if (body.bodyKind === "single") {
    const isOptionalBody =
      body.type.kind === "Model" ? !hasRequiredProperties(body.type) : undefined;

    const bodyProperty = realm.typeFactory.modelProperty("body", body.type, {
      optional: isOptionalBody,
    });

    realm.addType(bodyProperty);
    return bodyProperty;
  }

  if (body.bodyKind === "multipart") {
    throw new NotImplementedError("Multipart form data is not yet supported.");
  }

  throw new UnreachableCodeError(`Unsupported body kind: ${(body as any).bodyKind}`);
}

function getRlcResponseHeaderProperty(
  realm: Realm,
  headers: Record<string, ModelProperty>,
  contentTypes: string[]
): ModelProperty {
  const responseHeaders: ModelProperty[] = [];

  // Content type header is not included in the headers object in HttpOperationResponse, it is a property of the body
  // We need to put it back in the headers
  if (contentTypes.length === 1) {
    const contentTypeHeader = realm.typeFactory.modelProperty(
      "content-type",
      // TODO: when would this have more than one content-type?
      realm.typeFactory.stringLiteral(contentTypes[0])
    );

    realm.addType(contentTypeHeader);
    realm.typeFactory.finishType(contentTypeHeader);
    responseHeaders.push(contentTypeHeader);
  } else {
    throw new NotImplementedError("Handling multiple content types is not implemented yet.");
  }

  for (const key in headers) {
    const header = headers[key];

    // If there is more than one content type we need to create a union type for the header
    if (contentTypes.length > 0) {
      const headerType = realm.typeFactory.union(
        contentTypes.map((contentType) => realm.typeFactory.stringLiteral(contentType))
      );

      header.type = headerType;
    }

    responseHeaders.push(realm.typeFactory.modelProperty(key, header));
  }

  const prop = realm.typeFactory.modelProperty(
    "headers",
    realm.typeFactory.model("", responseHeaders)
  );

  realm.addType(prop);
  return prop;
}

function getRlcStatusCodeProperty(
  realm: Realm,
  statusCodes: number | HttpStatusCodeRange | "*"
): ModelProperty {
  if (typeof statusCodes === "number") {
    const prop = realm.typeFactory.modelProperty(
      "status",
      realm.typeFactory.stringLiteral(String(statusCodes))
    );
    realm.addType(prop);
    return prop;
  }

  if (statusCodes === "*") {
    const prop = realm.typeFactory.modelProperty("status", realm.typeFactory.scalar("string"));
    realm.addType(prop);
    return prop;
  }

  throw new NotImplementedError("Handling StatusCodeRange is not implemented yet.");
}
