import { ComponentChildren } from "#jsx/jsx-runtime";
import { Interface, Model, ModelProperty, Operation } from "@typespec/compiler";
import { filterComponentFromChildren } from "../framework/utils/children-component-utils.js";
import { isInterface, isModel } from "../framework/utils/typeguards.js";
import { Block } from "./block.js";
import { InterfaceMember } from "./interface-member.js";

export interface InterfaceExpressionProps {
  type?: Model | Interface;
  children?: ComponentChildren;
}

export function InterfaceExpression({ type, children: allChildren }: InterfaceExpressionProps) {
  const members = [];
  let typeMembers: IterableIterator<ModelProperty | Operation> | undefined;
  const [childrenMembers, children] = filterComponentFromChildren(allChildren, InterfaceMember);

  if (type) {
    if (isModel(type)) {
      typeMembers = type.properties.values();
    } else if (isInterface(type)) {
      typeMembers = type.operations.values();
    }

    for (const prop of typeMembers ?? []) {
      members.push(<InterfaceMember type={prop} />);
    }
  }

  if (childrenMembers) {
    members.push(childrenMembers);
  }

  return (
    <Block>
      {members}
      {children}
    </Block>
  );
}
