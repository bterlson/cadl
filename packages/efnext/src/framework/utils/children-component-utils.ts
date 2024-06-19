//  const bodyChild = coerceArray(children)?.find((child: any) => child.type === Function.Body);

import { ComponentChild, ComponentChildren, isSourceNode } from "#jsx/jsx-runtime";
import { coerceArray } from "./coerce-array.js";

/**
 * Filters a list of children into two lists: one containing only children of a specific type, and the other containing all other children.
 */
export function filterComponentFromChildren(
  children: ComponentChildren,
  type: unknown
): [ComponentChild[], ComponentChild[] | undefined] {
  const childrenArray = coerceArray(children);
  const matches: ComponentChild[] = [];
  const other: ComponentChild[] = [];
  for (const child of childrenArray ?? []) {
    if (isSourceNode(child) && child.type === type) {
      matches.push(child);
    } else {
      other.push(child);
    }
  }

  return [matches, other];
}
