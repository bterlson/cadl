import {
  getDiscriminatedUnion,
  getDiscriminator,
  ignoreDiagnostics,
  Model,
  ModelProperty,
  Type,
} from "@typespec/compiler";
import { $, ModelKit, ModelDescriptor } from "@typespec/compiler/typekit";

export interface SdkModelKit extends ModelKit {
  /**
   * Get the properties of a model.
   *
   * @param model model to get the properties
   */
  listProperties(): ModelProperty[];

  /**
   * Get type of additionalProperties, if there are additional properties
   *
   * @param model model to get the additional properties type of
   */
  getAdditionalPropertiesType(): Type | undefined;

  /**
   * Get discriminator of a model, if a discriminator exists
   *
   * @param model model to get the discriminator of
   */
  getDiscriminatorProperty(): ModelProperty | undefined;

  /**
   * Get value of discriminator, if a discriminator exists
   *
   * @param model
   */
  getDiscriminatorValue(): string | undefined;

  /**
   * Get the discriminator mapping of the subtypes of a model, if a discriminator exists
   *
   * @param model
   */
  getDiscriminatedSubtypes(): Map<string, Model>;

  /**
   * Get the base model of a model, if a base model exists
   *
   * @param model model to get the base model
   */
  getBaseModel(): Model | undefined;
}

export class ModelKitImpl implements SdkModelKit {
  private model: Model;

  constructor(model: Model) {
    this.model = model;
  }

  listProperties(): ModelProperty[] {
    return [...this.model.properties.values()];
  }

  getAdditionalPropertiesType(): Type | undefined {
    // model MyModel is Record<> {} should be model with additional properties
    if (this.model.sourceModel?.kind === "Model" && this.model.sourceModel?.name === "Record") {
      return this.model.sourceModel!.indexer!.value!;
    }
    // model MyModel { ...Record<>} should be model with additional properties
    if (this.model.indexer) {
      return this.model.indexer.value;
    }
    return undefined;
  }

  getDiscriminatorProperty(): ModelProperty | undefined {
    const discriminator = getDiscriminator($.program, this.model);
    if (!discriminator) return undefined;
    for (const property of this.listProperties()) {
      if (property.name === discriminator.propertyName) {
        return property;
      }
    }
    return undefined;
  }

  getDiscriminatorValue(): string | undefined {
    const disc = this.getDiscriminatorProperty();
    if (!disc) return undefined;
    switch (disc.type.kind) {
      case "String":
        return disc.type.value as string;
      case "EnumMember":
        return disc.type.name;
      default:
        throw Error("Discriminator must be a string or enum member");
    }
  }

  getDiscriminatedSubtypes(): Map<string, Model> {
    const disc = getDiscriminator($.program, this.model);
    if (!disc) return new Map();
    const discriminatedUnion = ignoreDiagnostics(getDiscriminatedUnion(this.model, disc));
    return discriminatedUnion?.variants || new Map();
  }

  getBaseModel(): Model | undefined {
    return this.model.baseModel;
  }

  create(descriptor: ModelDescriptor): Model {
    return $.model.create(descriptor);
  };

  is(type: Type): type is Model {
    return $.model.is(type)
  }

  isExpresion(type: Model): boolean{
    return $.model.isExpresion(type)
  }

  getEffectiveModel(model: Model, filter?: (property: ModelProperty) => boolean): Model {
    return $.model.getEffectiveModel(model, filter)
  }
}
