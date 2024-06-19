import { ComponentChild, ComponentChildren, FunctionComponent, SourceNode } from "#jsx/jsx-runtime";
import { setImmediate } from "node:timers/promises";
import { format } from "prettier";
import { MetaNode, getMeta } from "./metatree.js";
import { getPrinter } from "./use-printer.js";
import { notifyResolved } from "./use-resolved.js";

export interface RenderContext {
  node?: RenderedTreeNode;
  meta?: MetaNode;
}

let renderContext: RenderContext = {
  node: undefined,
  meta: undefined,
};

export function getRenderContext() {
  return renderContext;
}

export type RenderedTreeNode = (string | RenderedTreeNode)[];

const intrinsicMap: Record<string, string> = {
  rb: "}",
  lb: "{",
  br: "\n",
};

export interface SourceFileRecord {
  path: string;
  content: string;
}

interface RenderToSourceFilesOptions {
  format?: boolean;
}

export async function renderToSourceFiles(
  root: SourceNode,
  options: RenderToSourceFilesOptions = { format: true }
): Promise<SourceFileRecord[]> {
  const res = await render(root);
  const sourceFiles: SourceFileRecord[] = [];

  for (const node of res) {
    if (!Array.isArray(node)) {
      continue;
    }

    const files = await findRenderedSourceFiles(node);
    sourceFiles.push(...files);
  }

  return sourceFiles;
}

/**
 * Walks a tree of rendered nodes and returns all source files found.
 * @param node a rendered node
 * @returns a list of rendered source files.
 */
async function findRenderedSourceFiles(node: RenderedTreeNode): Promise<SourceFileRecord[]> {
  const files: SourceFileRecord[] = [];

  // If the node is not an array, there are no source files to find.
  if (!Array.isArray(node)) {
    return files;
  }

  // Walk the children of the node.
  for (const child of node) {
    // If the child is not an array, it is a string and not a source file.
    if (!Array.isArray(child)) {
      continue;
    }

    // Get the meta data for the child node. With this we can figure out if
    // it is a soruce file or not.
    const meta = getMeta(child);
    if (meta.sourceFile) {
      // Extract metadata from the metatree for the rendered source file and add it to the list.
      files.push({
        path: meta.sourceFile.path,
        content: await printFormatted(child, meta.sourceFile.fileType),
      });
    } else {
      // Recursively find source files in the child node.
      const childFiles = await findRenderedSourceFiles(child);
      files.push(...childFiles);
    }
  }

  return files;
}

export async function render(root: SourceNode): Promise<RenderedTreeNode> {
  // todo: check for forward progress.
  // I /think/ this should work to ensure render doesn't resolve until
  // all async work called from render finishes. But, it won't work
  // for any async work that is queued as a result of an resolution.

  const res = renderWorker(root);
  await setImmediate();
  await notifyResolved();

  return res;
}

export function renderWorker(root: SourceNode): RenderedTreeNode {
  if (isIntrinsicComponent(root)) {
    return [intrinsicMap[root.type]];
  }

  assertIsFunctionComponent(root);
  const node: RenderedTreeNode = [];
  const meta = getMeta(node);
  meta.parent = renderContext.meta;
  meta.type = root.type;
  const oldContext = renderContext;
  renderContext = {
    meta,
    node,
  };

  let children = root.type(root.props);
  if (children instanceof Promise) {
    children.then((children) => {
      handleChildren(node, children);
    });
  } else {
    handleChildren(node, children);
  }

  renderContext = oldContext;

  return node;
}

function handleChildren(node: RenderedTreeNode, children: ComponentChildren) {
  if (!Array.isArray(children)) {
    children = [children];
  }

  children = children.flat(Infinity);

  for (const child of children) {
    if (isSourceNode(child)) {
      const childRender = renderWorker(child);
      node.push(childRender);
    } else if (child instanceof Promise) {
      const index = node.push("{ pending }");
      child.then((v) => {
        node[index - 1] = v;
      });
    } else if (child === undefined || child === null || typeof child === "boolean") {
      continue;
    } else {
      node.push(String(child));
    }
  }
}

function isIntrinsicComponent(node: SourceNode): node is SourceNode & { type: string } {
  return typeof node.type === "string";
}

function assertIsFunctionComponent(
  node: SourceNode
): asserts node is SourceNode & { type: FunctionComponent } {
  if (typeof node.type !== "function") {
    throw new Error("Expected function component");
  }
}

function isSourceNode(element: ComponentChild): element is SourceNode {
  return typeof element === "object" && element !== null && Object.hasOwn(element, "type");
}

export async function printFormatted(
  root: RenderedTreeNode,
  filetype: "typescript" | "python"
): Promise<string> {
  const raw = print(root);
  // todo: handle langauges we can format/not format.
  if (filetype === "typescript") {
    return format(raw, { parser: filetype });
  } else {
    return raw;
  }
}

export function print(root: RenderedTreeNode): string {
  const customPrinter = getPrinter(root);
  if (customPrinter) {
    return customPrinter(root);
  }

  return printChildren(root);
}

export function printChildren(root: RenderedTreeNode): string {
  let printed = "";
  for (const child of root) {
    if (typeof child === "string") {
      printed += child;
    } else {
      printed += print(child);
    }
  }

  return printed;
}
