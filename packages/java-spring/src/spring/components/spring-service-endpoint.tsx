import { Children } from "@alloy-js/core";
import * as jv from "@alloy-js/java";
import { Generics } from "@alloy-js/java";
import { $ } from "@typespec/compiler";
import { TypeExpression } from "@typespec/emitter-framework/java";
import { HttpOperation } from "@typespec/http";
import { FlatHttpResponse } from "@typespec/http/typekit";
import { springFramework } from "../libraries/index.js";
import { SpringRouteAnnotation } from "./route-annotations.js";
import { SpringEndpointParameters } from "./spring-service-endpoint-parameters.js";

export interface SpringServiceEndpointProps {
  op: HttpOperation;
  children?: Children;
}

/**
 * Creates a spring service endpoint method for a given operation. Handles definitions like responses, query params,
 * path params, headers etc. Calls upon generated business logic interface for logic.
 *
 * @param op The HttpOperation to create the endpoint for
 */
export function SpringServiceEndpoint({ op, children }: SpringServiceEndpointProps) {
  const route = op.verb;
  const path = <jv.Value value={op.path} />;

  const routeAnnotation = <SpringRouteAnnotation kind={route} parameters={{ "": path }} />;

  // Return will always be ResponseEntity<T>, with T being either the body type or Void
  // If multiple response types, like MyDataModel | OkResponse, will be ResponseEntity<?> as type is unknown
  const response: FlatHttpResponse = $.httpOperation.getResponses(op.operation)[0];
  const responseBodyType = response.responseContent.body?.type;

  let returnType;
  if (op.responses.length > 1) {
    // prettier-ignore
    returnType = (
      <>
        {springFramework.ResponseEntity}<Generics types={['?']} />
      </>
    );
  } else if (responseBodyType) {
    // prettier-ignore
    returnType = (
      <>
        {springFramework.ResponseEntity}<Generics types={[<TypeExpression type={responseBodyType} />]} />
      </>
    );
  } else {
    // prettier-ignore
    returnType = (
      <>
        {springFramework.ResponseEntity}<Generics types={["Void"]} />
      </>
    );
  }

  const springParams = SpringEndpointParameters(op);
  return (
    <>
      {routeAnnotation}
      <jv.Method public name={op.operation.name} parameters={springParams} return={returnType}>
        {children}
      </jv.Method>
    </>
  );
}
