import { ComponentChildren } from "#jsx/jsx-runtime";
import { BinderContext, OutputDeclaration } from "../core/binder.js";
import { createContext, useContext } from "../core/context.js";
import { ScopeContext } from "./scope.js";

const DeclarationContext = createContext<OutputDeclaration>();

export interface DeclarationProps {
  name: string;
  refkey?: unknown;
  children?: ComponentChildren;
}
export function Declaration({ name, children, refkey}: DeclarationProps) {
  if (refkey === undefined) {
    // todo: use FQN
    refkey = name;
  }
  const currentDeclaration = useContext(DeclarationContext);
  if (currentDeclaration) {
    throw new Error("Cannot nest declarations");
  }

  const binder = useContext(BinderContext)
  if (!binder) {
    throw new Error("Need binder context to create declarations");
  }
  const scope = useContext(ScopeContext);
  const declaration = binder.createDeclaration(name, scope, refkey);
  return <DeclarationContext.Provider value={declaration}>
    {children}
  </DeclarationContext.Provider>
}