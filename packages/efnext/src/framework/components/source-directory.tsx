import { ComponentChildren } from "#jsx/jsx-runtime";
import { BinderContext, GlobalScope, ModuleScope } from "../core/binder.js";
import { createContext, useContext } from "../core/context.js";
import { getRenderContext } from "../core/render.js";
import { ScopeContext } from "./scope.js";

export interface SourceDirectoryProps {
  path: string;
  children?: ComponentChildren[];
}

interface SourceDirectoryState {
  scope: ModuleScope;
}

export const SourceDirectoryContext = createContext<SourceDirectoryState>();

export function SourceDirectory({ path, children }: SourceDirectoryProps) {
  const renderContext = getRenderContext();
  renderContext.meta!.sourceDirectory = { path };

  const binder = useContext(BinderContext);
  if (!binder) {
    throw new Error("Scope requires binder context");
  }

  const currentScope = useContext(ScopeContext);
  const scope = binder.createModuleScope(path, currentScope?.parent as ModuleScope | GlobalScope);

  const sourceDirectoryState: SourceDirectoryState = {
    scope,
  };

  return (
    <SourceDirectoryContext.Provider value={sourceDirectoryState}>
      <ScopeContext.Provider value={scope}>{children}</ScopeContext.Provider>
    </SourceDirectoryContext.Provider>
  );
}
