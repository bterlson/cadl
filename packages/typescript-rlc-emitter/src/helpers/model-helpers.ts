import { Model, ModelProperty } from "@typespec/compiler";

interface HasRequiredPropertiesOptions {
  disableRecursive?: boolean;
}

/**
 * Check if the model or properties have any required properties.
 *
 * @param {Model | ModelProperty[]} modelOrProperties The model or properties to check.
 * @returns {boolean} True if the model or properties have required properties, false otherwise.
 */
export function hasRequiredProperties(
  modelOrProperties: Model | ModelProperty[],
  { disableRecursive }: HasRequiredPropertiesOptions = {}
): boolean {
  let properties: ModelProperty[] = [];

  if (Array.isArray(modelOrProperties)) {
    properties = modelOrProperties;
  } else {
    properties = Array.from(modelOrProperties.properties.values());
  }

  for (const prop of properties) {
    if (!prop.optional) {
      return true;
    }

    if (prop.type.kind === "Model" && !disableRecursive) {
      const submodelHasRequired = hasRequiredProperties(prop.type, { disableRecursive });
      if (submodelHasRequired) {
        return true;
      }
    }
  }

  return false;
}
