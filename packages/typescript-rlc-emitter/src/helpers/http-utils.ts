import { ModelProperty, Operation, Realm, Type } from "@typespec/compiler";
import { isModel } from "@typespec/efnext/framework";
import { HttpOperation } from "@typespec/http";

export function hasBodyParameter(httpOperation: HttpOperation): boolean {
  return Boolean(httpOperation.parameters.body?.type);
}

/**
 * Retrieves the parameters of a given type from an HTTP operation.
 *
 * @param {object} httpOperation - The HTTP operation containing parameters.
 * @param {string} type - The type of parameters to retrieve (e.g., "query", "header").
 * @returns {Array} - An array of parameters of the specified type.
 */
export function getHttpParameters(
  httpOperation: HttpOperation,
  type: "query" | "header" | "path"
): ModelProperty[] {
  return httpOperation.parameters.parameters.filter((p) => p.type === type).map((p) => p.param);
}

/**
 * Sets the body parameter for the clone's properties.
 *
 * @param {object} op - The operation to sate the body parameter on.
 * @param {object} realm - The realm to create cloned types.
 * @param {object} bodyParam - The body parameter to set.
 */
export function setBodyParameter(op: Operation, realm: Realm, bodyParam: Type): void {
  if (!isModel(bodyParam)) {
    return;
  }

  const optional = !Array.from(bodyParam.properties.values()).some((p) => !p.optional);
  const body = realm.typeFactory.modelProperty("body", bodyParam, { optional });

  op.parameters.properties.set("bodyParameters", body);
}

/**
 * Sets the query parameters on an operation
 *
 * @param {object} op - The operation to append the query parameters to.
 * @param {object} realm - The realm to create cloned types.
 * @param {Array} queryParams - The query parameters to set.
 */
export function setQueryParameters(
  op: Operation,
  realm: Realm,
  queryParams: ModelProperty[]
): void {
  const clonedQueryParams = queryParams.map((p) => realm.clone(p));
  const optional = !clonedQueryParams.some((p) => !p.optional);
  const query = realm.typeFactory.modelProperty(
    "query",
    realm.typeFactory.model("", clonedQueryParams),
    { optional }
  );
  op.parameters.properties.set("queryParameters", query);
}

/**
 * Sets the header parameters for an operation.
 *
 * @param {object} op - The operation to set the header params on.
 * @param {object} realm - The realm to create cloned types.
 * @param {Array} headerParams - The header parameters to set.
 */
export function setHeaderParameters(
  op: Operation,
  realm: Realm,
  headerParams: ModelProperty[]
): void {
  const clonedHeaderParams = headerParams.map((p) => realm.clone(p));
  const optional = !clonedHeaderParams.some((p) => !p.optional);
  const headers = realm.typeFactory.modelProperty(
    "headers",
    realm.typeFactory.model("", clonedHeaderParams),
    { optional }
  );
  op.parameters.properties.set("headers", headers);
}
