import { Interface, Namespace, Operation } from "@typespec/compiler";
import { pascalCase } from "change-case";

export function getOperationFullName(op: Operation): string {
  const containerName = getContainerFullName(op.interface ?? op.namespace);
  const operationName = pascalCase(op.name);

  return pascalCase(`${containerName} ${operationName}`);
}

export function getContainerFullName(container: Interface | Namespace | undefined): string {
  if (!container) {
    return "";
  }

  const containerName = container.name;
  // TODO: Handle casing

  if ("interface" in container) {
    return getContainerFullName(container.interface as Interface) + container;
  }

  return getContainerFullName(container.namespace) + containerName;
}
