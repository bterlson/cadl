import { code, refkey } from "@alloy-js/core";
import { Generics, javaUtil, Value } from "@alloy-js/java";
import { IntrinsicType, Scalar, Type } from "@typespec/compiler";
import { $ } from "@typespec/compiler/typekit";
import { isArray } from "../../core/index.js";

export interface TypeExpressionProps {
  type: Type;
}

export function TypeExpression({ type }: TypeExpressionProps) {
  switch (type.kind) {
    case "Scalar":
    case "Intrinsic":
      return <>{getScalarIntrinsicExpression(type)}</>;
    case "Boolean":
    case "Number":
    case "String":
      return <Value value={type.value} />;
    case "Union":
      return "Object";
    case "EnumMember":
      return (
        <>
          {type.enum.name}.{type.name}
        </>
      );
    case "TemplateParameter":
      return type?.node?.symbol?.name ?? null;
    case "ModelProperty":
      return <TypeExpression type={type.type} />;
    case "Model":
      // Special case: If has template arguments, indexer will be null so we need to use
      // the templateMapper to determine the Array type
      if (type.name === "Array" && (type?.templateMapper?.args?.length ?? 0) >= 1) {
        const genericArgs = type.templateMapper?.args;
        const genericsString =
          (genericArgs?.length ?? 0) > 0 ? (
            <Generics types={genericArgs?.map((gen) => <TypeExpression type={gen as Type} />)} />
          ) : (
            ""
          );
        return code`${javaUtil.List}${genericsString}`;
      }

      if (isArray(type)) {
        return code`${javaUtil.List}${(<Generics types={[<TypeExpression type={type.indexer.value} />]} />)}`;
      }

      // Collect generic arguments
      const genericArgs = type.templateMapper?.args;
      const genericsString =
        (genericArgs?.length ?? 0) > 0 ? (
          <Generics types={genericArgs?.map((gen) => <TypeExpression type={gen as Type} />)} />
        ) : (
          ""
        );

      return code`${refkey(type)}${genericsString}`;

    default:
    // console.warn("TypeExpression: unhandled type", type);
  }
}

export const intrinsicNameToJavaType = new Map<string, string>([
  ["unknown", "Object"], // Java does not have an equivalent for "unknown"
  ["string", "String"],
  ["int32", "Integer"],
  ["int16", "short"],
  ["float16", "float"], // Java does not have float16, using float
  ["integer", "int"],
  ["float", "float"],
  ["float32", "float"],
  ["int64", "long"],
  ["boolean", "boolean"],
  ["null", "null"], // Java's null is the same
  ["void", "void"],
  ["numeric", "double"], // Java uses double for general numeric values
  ["uint64", "BigInteger"], // Java does not have unsigned, use BigInteger for large numbers
  ["uint32", "long"], // Larger range without unsigned
  ["uint16", "int"],
  ["bytes", "byte[]"], // Java uses byte array
  ["float64", "double"], // Use double for 64-bit floating-point numbers
  ["safeint", "long"], // Safe integer can map to long for larger range
  ["utcDateTime", "java.time.ZonedDateTime"], // Java 8+ uses java.time for dates
  ["url", "java.net.URL"], // Java URL type
]);

function getScalarIntrinsicExpression(type: Scalar | IntrinsicType): string {
  let intrinsicName: string;
  if ($.scalar.is(type)) {
    if ($.scalar.isUtcDateTime(type) || $.scalar.extendsUtcDateTime(type)) {
      const encoding = $.scalar.getEncoding(type);
      let emittedType = "java.util.Date";
      switch (encoding?.encoding) {
        case "unixTimestamp":
          emittedType = "Long";
          break;
        case "rfc7231":
        case "rfc3339":
        default:
          emittedType = "java.util.Date";
          break;
      }

      return emittedType;
    }

    intrinsicName = $.scalar.getStdBase(type)?.name ?? "";
  } else {
    intrinsicName = type.name;
  }

  const javaType = intrinsicNameToJavaType.get(intrinsicName);
  if (!javaType) {
    throw new Error(`Unknown scalar type ${intrinsicName}`);
  }
  return javaType;
}
