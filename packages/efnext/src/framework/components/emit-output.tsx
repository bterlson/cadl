import { ComponentChildren } from "#jsx/jsx-runtime";
import { BinderContext, createOutputBinder } from "../core/binder.js";
import { NamePolicy, createNamePolicy } from "../core/name-policy.js";

export interface EmitOutputProps {
  namePolicy?: NamePolicy
  children?: ComponentChildren
}

export function EmitOutput({ namePolicy, children }: EmitOutputProps) {
  namePolicy ??= createNamePolicy((type) => "name" in type && typeof type.name === "string"  ? type.name : "<unknown name>");

  const binder = createOutputBinder();
  return <BinderContext.Provider value={binder}>
    <namePolicy.Provider>
      {children}
    </namePolicy.Provider>
  </BinderContext.Provider>
}
