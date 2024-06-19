import { RenderedTreeNode, getRenderContext } from "./render.js";

const printers = new Map<RenderedTreeNode, (node: RenderedTreeNode) => string>();

export function usePrinter(cb: (node: RenderedTreeNode) => string) {
  const renderContext = getRenderContext();
  printers.set(renderContext.node!, cb);
}

export function getPrinter(node: RenderedTreeNode) {
  return printers.get(node);
}
