import { getParentTemplateNode, Node } from "@typespec/compiler";

export function getTemplateParams(node: Node): string[] {
  const parentTemplateNode = node ? getParentTemplateNode(node) : undefined;
  if (parentTemplateNode) {
    const templateGenericsArray = Array.from(parentTemplateNode.locals?.entries() || []);
    return templateGenericsArray.map(([_, value]) => value.name);
  }
  return [];
}
