import { Children, ComponentContext, createContext, useContext } from "@alloy-js/core";
import { Operation } from "@typespec/compiler";
import { $ } from "@typespec/compiler/typekit";
import { Client } from "@typespec/http-client-library";

interface ClientLibraryProps {
  client: Client;
  children?: Children;
}

export function ClientComponent(props: ClientLibraryProps) {
  return (
    <ClientContext.Provider
      value={{
        client: props.client,
        getName: () => $.client.getName(props.client),
        getConstructor() {
          return $.client.getConstructor(props.client);
        },
        listServiceOperations() {
          return $.client.listServiceOperations(props.client);
        },
      }}
    >
      {props.children}
    </ClientContext.Provider>
  );
}

interface ClientContext {
  client: Client;
  getName(): string;
  getConstructor(): Operation;
  listServiceOperations(): Operation[];
}

const ClientContext: ComponentContext<ClientContext> = createContext<ClientContext>();

export function useClientContext() {
  return useContext(ClientContext)!;
}
