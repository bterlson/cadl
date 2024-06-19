import { ComponentChildren } from "#jsx/jsx-runtime";
import { join } from "path";
import { BinderContext, GlobalScope, ModuleScope } from "../core/binder.js";
import { createContext, useContext } from "../core/context.js";
import { MetaNode } from "../core/metatree.js";
import { getRenderContext } from "../core/render.js";
import { useResolved } from "../core/use-resolved.js";
import { ScopeContext } from "./scope.js";

export interface SourceFileProps {
  path: string;
  filetype: "typescript" | "python";
  children?: ComponentChildren[];
}

interface ImportRecord {
  importPath: string;
  name: string;
  pathKind?: "relative" | "absolute";
}

interface SourceFileState {
  imports: Map<string, ImportRecord[]>;
  addImport(record: ImportRecord): void;
  scope: ModuleScope;
}

export const SourceFileContext = createContext<SourceFileState>();

export function SourceFile({ path, filetype, children }: SourceFileProps) {
  const renderContext = getRenderContext();
  const fullPath = resolvePath(renderContext.meta, path);
  renderContext.meta!.sourceFile = { path: fullPath, fileType: filetype };

  const binder = useContext(BinderContext);
  if (!binder) {
    throw new Error("Scope requires binder context");
  }

  const currentScope = useContext(ScopeContext);
  const scope = binder.createModuleScope(path, currentScope?.parent as ModuleScope | GlobalScope);
  const imports: Map<string, ImportRecord[]> = new Map();
  const sourceFileState: SourceFileState = {
    scope,
    imports,
    addImport(record) {
      if (!imports.has(record.importPath)) {
        imports.set(record.importPath, []);
      }

      const records = imports.get(record.importPath)!;

      // todo: consider making this a set.
      if (records.find((r) => r.name === record.name)) {
        return;
      }

      records.push(record);
    },
  };

  const ImportContainer = useResolved(() => {
    let importString = "";
    for (const [importPath, records] of imports) {
      if (filetype === "typescript") {
        const isRelativePath = records.some(
          (r) => r.pathKind === undefined || r.pathKind === "relative"
        );
        const pathPrefix = isRelativePath ? "./" : "";
        importString += `import {${records.map((r) => r.name).join(", ")}} from "${pathPrefix}${importPath.replace(/\.ts$/, ".js")}"\n`;
      }

      if (filetype === "python") {
        importString += `from ${importPath.replace(/\.py$/, "")} import ${records.map((r) => r.name).join(", ")}\n`;
      }
    }

    return <>{importString}</>;
  });

  return (
    <SourceFileContext.Provider value={sourceFileState}>
      <ImportContainer />
      <br />
      <ScopeContext.Provider value={scope}>{children}</ScopeContext.Provider>
    </SourceFileContext.Provider>
  );
}

function resolvePath(node: MetaNode | undefined, path: string) {
  const parent = node?.parent;

  if (!parent) {
    return path;
  }

  if (parent.sourceDirectory) {
    return resolvePath(parent, join(parent.sourceDirectory.path, path));
  }

  return resolvePath(parent, path);
}
