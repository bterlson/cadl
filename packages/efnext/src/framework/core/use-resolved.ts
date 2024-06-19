import { SourceNode } from "#jsx/jsx-runtime";
import { RenderedTreeNode, getRenderContext, renderWorker } from "./render.js";

const resolveCallbacks = new Set<() => Promise<void>>();

export function useResolved(cb: () => SourceNode) {
  let nodeToFill: RenderedTreeNode;

  resolveCallbacks.add(async () => {
    if (!nodeToFill) {
      throw new Error("Didn't find place to put content");
    }

    const children = await renderWorker(cb());
    nodeToFill.push(children);
  });

  return function OnResolved() {
    const renderContext = getRenderContext();
    if (!renderContext.node) {
      throw new Error("Need node to put stuff in");
    }

    nodeToFill = renderContext.node;
    return;
  };
}

export async function notifyResolved() {
  for (const cb of resolveCallbacks) {
    await cb();
  }
  resolveCallbacks.clear();
}
