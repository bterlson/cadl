import { Children, ComponentContext, createContext, useContext } from "@alloy-js/core";
import { ModelProperty, Operation } from "@typespec/compiler";
import { $ } from "@typespec/compiler/typekit";
import { useClientContext } from "./client-context.jsx";

interface OperationProps {
  operation: Operation;
  children?: Children;
}

export function OperationComponent(props: OperationProps) {
  const clientContext = useClientContext();
  return (
    <OperationContext.Provider
      value={{
        operation: props.operation,
        getClientSignature: () => {
          return $.operation.getClientSignature(clientContext.client, props.operation);
        },
      }}
    >
      {props.children}
    </OperationContext.Provider>
  );
}

export interface OperationContext {
  operation: Operation;
  getClientSignature(): ModelProperty[];
}

export const OperationContext: ComponentContext<OperationContext> =
  createContext<OperationContext>();

export function useOperationContext() {
  const clientContext = useClientContext();
  return useContext(OperationContext)!;
}
