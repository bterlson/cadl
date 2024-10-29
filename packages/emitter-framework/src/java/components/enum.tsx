import { mapJoin } from "@alloy-js/core";
import * as jv from "@alloy-js/java";
import { useJavaNamePolicy } from "@alloy-js/java";
import { Enum } from "@typespec/compiler";

export interface EnumProps {
  type: Enum;
}

/**
 * Define a Java enum based on the TypeSpec Enum.
 */
export function EnumDeclaration({ type }: EnumProps) {
  const members = Array.from(type.members.values());
  const namePolicy = useJavaNamePolicy();

  let valueType: string | undefined;
  let isConsistent = true;

  members.forEach((member, index) => {
    if (member.value !== undefined && member.value !== null) {
      const currentType =
        typeof member.value === "string"
          ? "String"
          : member.value - Math.floor(member.value) !== 0
            ? "double"
            : "int";

      if (valueType === undefined) {
        valueType = currentType;
      } else if (valueType !== currentType) {
        isConsistent = false;
      }
    }
  });

  // TypeSpec allows you to mix and match values, for a Java enum have to have one value
  if (!isConsistent) {
    throw new Error(
      `Enum '${type.name}' has inconsistent value types. Emitter only supports having one type across all values.`,
    );
    // Instead create a class with static fields as we
    // can mix-and-match types. Accessing is exact same as enums, although just
    // not an actual Java enum
    // TODO: Following code works except Alloy needs to allow you to override namepolicy for variable,
    // TODO: Since right now it's declaring name as lowercase which makes this not work as it should
    // return (
    //   <jv.Class public final name={type.name}>
    //     {mapJoin(
    //       members,
    //       (member) => {
    //         if (!member.value) return null;
    //         const valueName = namePolicy.getName(member.name, "constant");
    //         const currentType =
    //           typeof member.value === "string"
    //             ? "String"
    //             : member.value - Math.floor(member.value) !== 0
    //               ? "double"
    //               : "int";
    //         return (
    //           <jv.Variable
    //             type={currentType}
    //             name={valueName}
    //             value={<jv.Value value={member.value} />}
    //             public
    //             static
    //           />
    //         );
    //       },
    //       { joiner: "\n" },
    //     )}
    //
    //     <jv.Constructor name={type.name} private />
    //   </jv.Class>
    // );
  }

  let constructor = null;
  let variable = null;
  let getter = null;
  if (valueType) {
    variable = <jv.Variable type={valueType} name="value" private={true} />;
    getter = (
      <jv.Method name={"getValue"} return={valueType} public>
        return this.value;
      </jv.Method>
    );

    constructor = (
      <jv.Constructor name={type.name} parameters={{ value: valueType }}>
        this.value = value;
      </jv.Constructor>
    );
  }

  const joinedMembers = mapJoin(
    members,
    (member) => {
      let value;
      if (valueType) {
        value = <jv.Value value={member.value} />;
      } else {
        value = "";
      }
      return <jv.EnumMember name={member.name} arguments={value} />;
    },
    { joiner: ",\n" },
  );

  // prettier-ignore
  return valueType ? <jv.Enum name={type.name}>
    {joinedMembers};

    {variable}

    {getter}

    {constructor}
  </jv.Enum> : <jv.Enum name={type.name}>
    {joinedMembers}
  </jv.Enum>
}
