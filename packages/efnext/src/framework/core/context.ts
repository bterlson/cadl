import { ComponentChildren, FunctionComponent } from "#jsx/jsx-runtime";
import { getRenderContext } from "./render.js";

export interface Context<T = unknown> {
  id: symbol;
  Provider: FunctionComponent;
  currentValue: T | undefined;
}

interface ProviderProps {
  value?: unknown;
  children?: ComponentChildren;
}
export function createContext<T = unknown>(defaultValue?: T): Context<T> {
  const id = Symbol();

  return {
    id,
    currentValue: defaultValue,
    Provider({ value, children }: ProviderProps) {
      const renderContext = getRenderContext();
      renderContext.meta!.contextId = id;
      renderContext.meta!.contextValue = value;

      return children;
    },
  };
}

export function useContext<T>(context: Context<T>): T | undefined {
  const renderContext = getRenderContext();

  // context must come from a parent
  let metaNode = renderContext.meta!.parent;
  while (metaNode) {
    if (metaNode.contextId === context.id) {
      return metaNode.contextValue as T;
    }

    metaNode = metaNode.parent;
  }

  return undefined;
}
