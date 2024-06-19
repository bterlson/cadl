import { ComponentChildren, FunctionComponent } from "#jsx/jsx-runtime";
import { Type } from "@typespec/compiler";
import { createContext, useContext } from "./context.js";

export interface RenamerCallback<TKinds extends string = string> {
  (type: Type, kind: TKinds): string;
}

export interface NamePolicyProviderProps {
  children?: ComponentChildren;
}

export interface Renamer<TKinds extends string = string> {
  getName(type: Type, kind: TKinds): string;
  setName(type: Type, name: string): void;
}

export interface NamePolicy<TKinds extends string = string> {
  renamer: Renamer<TKinds>;
  Provider: FunctionComponent;
}

export const RenamingPolicyContext = createContext<Renamer>();
export function useNamePolicy() {
  // it's possible this is undefined if you don't use the <EmitOutput> component
  // which initializes the default naming policy, but that seems rare.
  return useContext(RenamingPolicyContext)!;
}

export function createNamePolicy<TKinds extends string = string>(namer: RenamerCallback<TKinds>) {
  const overrides = new WeakMap<Type, string>();

  const renamer: Renamer<TKinds> = {
    getName(type, kind) {
      if (overrides.has(type)) {
        return overrides.get(type)!;
      }

      return namer(type, kind);
    },
    setName(type: Type, name: string) {
      overrides.set(type, name);
    },
  };

  function Provider(props: NamePolicyProviderProps) {
    return (
      <RenamingPolicyContext.Provider value={renamer}>
        {props.children}
      </RenamingPolicyContext.Provider>
    );
  }

  return {
    renamer,
    Provider,
  };
}
