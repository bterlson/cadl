import { javaUtil } from "@alloy-js/java";
import { ModelProperty } from "@typespec/compiler";

export interface ConstructorMemberProps {
  type: ModelProperty;
}

/**
 * Instantiate class member via constructor
 */
export function ConstructorMember({ type }: ConstructorMemberProps) {
  // If required, use non-null check
  if (!type.optional) {
    // prettier-ignore
    return (
      <>
        this.{type.name} = {javaUtil.Objects}.requireNonNull({type.name}, "{type.name} cannot be null");
      </>
    );
  }

  return (
    <>
      this.{type.name} = {type.name};
    </>
  );
}
