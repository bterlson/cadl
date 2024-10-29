import { Children, refkey as getRefkey, mapJoin } from "@alloy-js/core";
import { Class, Constructor, Generics, useJavaNamePolicy } from "@alloy-js/java";
import { $, Model, ModelProperty, Type } from "@typespec/compiler";
import { getTemplateParams } from "../utils.js";
import { Getter } from "./getter.js";
import { ModelConstructor } from "./model-constructor.js";
import { ModelMember } from "./model-member.js";
import { Setter } from "./setter.js";
import { TypeExpression } from "./type-expression.js";

export interface ModelDeclarationProps {
  type: Model;
  propertyComponent?: (property: ModelProperty) => Children;
}

/**
 * Generate basic java class for a model
 */
export function ModelDeclaration({
  type,
  propertyComponent = (property) => <ModelMember type={property} />,
}: ModelDeclarationProps) {
  const namePolicy = useJavaNamePolicy();

  const properties = Array.from(type?.properties?.values() ?? []).filter((p) => {
    return !p.decorators?.some((d) => d.definition?.name === "@statusCode");
  });

  const name = namePolicy.getName(type.name, "class");
  const generics = type.node ? getTemplateParams(type.node) : undefined;
  const genericObject: Record<string, string> = {};
  generics?.forEach((generic) => (genericObject[generic] = ""));
  const refkey = getRefkey(type);

  // Collect base model that this model extends from. Also collect generic arguments if any
  const baseModel = type.baseModel;
  const genericArgs = baseModel ? baseModel.templateMapper?.args : [];
  // Build generic string
  const baseModelGenericsString =
    (genericArgs?.length ?? 0) > 0 ? (
      <Generics types={genericArgs?.map((gen) => <TypeExpression type={gen as Type} />)} />
    ) : (
      ""
    );
  const baseModelExpression = baseModel ? getRefkey(baseModel) : "";
  // prettier-ignore
  const extendsExpression = (
    <>
      {baseModelExpression}{baseModelGenericsString}
    </>
  );

  const isErrorModel = $.model.isErrorModel(type);

  return (
    <Class
      final={type.derivedModels.length === 0}
      public
      name={name}
      refkey={refkey}
      generics={generics?.length !== 0 ? genericObject : undefined}
      extends={isErrorModel ? "Exception" : baseModel ? extendsExpression : undefined}
    >
      {""}
      {mapJoin(
        properties,
        (property) => {
          return propertyComponent(property);
        },
        { joiner: "\n" },
      )}

      {properties.length !== 0 && <Constructor public />}

      <ModelConstructor type={type} />

      {mapJoin(
        properties,
        (property) => {
          return (
            <>
              <Getter type={property} />

              <Setter type={property} />
            </>
          );
        },
        { joiner: "\n\n" },
      )}
      {""}
    </Class>
  );
}
