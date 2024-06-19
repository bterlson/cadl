import { EnumMember } from "@typespec/compiler";

export interface EnumExpressionProps {
  type: EnumMember;
}

export function EnumExpression({ type }: EnumExpressionProps) {
  const value = type.value ? ` = ${JSON.stringify(type.value)}` : "";

  return (
    <>
      {type.name}
      {value},
    </>
  );
}
