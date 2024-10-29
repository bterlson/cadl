import { defineKit } from "@typespec/compiler/typekit";
import { getRoutePath } from "../../route.js";
import { OperationContainer } from "../../types.js";

export interface HttpOperationContainerKit {
  operationContainer: {
    getRoutePath(container: OperationContainer): string | undefined;
  };
}

declare module "@typespec/compiler/typekit" {
  interface TypekitPrototype extends HttpOperationContainerKit {}
}

defineKit<HttpOperationContainerKit>({
  operationContainer: {
    getRoutePath(container: OperationContainer) {
      return getRoutePath(this.program, container)?.path;
    },
  },
});
