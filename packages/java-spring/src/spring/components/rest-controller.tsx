import { Children } from "@alloy-js/core";
import * as jv from "@alloy-js/java";
import { useJavaNamePolicy } from "@alloy-js/java";
import { $ } from "@typespec/compiler/typekit";
import { OperationContainer } from "@typespec/http";
import { springFramework } from "../libraries/index.js";

export interface RestControllerProps {
  container: OperationContainer;
  name?: string;
  children?: Children;
}

/**
 * Define spring rest controller to handle routes for a path. Need to pass individual
 * http operations as children
 *
 * @param props Takes {@link OperationContainer} to create controller from
 */
export function RestController(props: RestControllerProps) {
  const namePolicy = useJavaNamePolicy();
  const name = namePolicy.getName(props.name ? props.name : props.container.name, "class");

  // Get route decorator on container
  const routePath = $.operationContainer.getRoutePath(props.container);

  return (
    <>
      <jv.Annotation type={springFramework.RestController} />
      <jv.Class public name={`${name}Controller`}>
        {props.children}
      </jv.Class>
    </>
  );
}
