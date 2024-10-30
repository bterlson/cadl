import { Enum, Model, Namespace } from "@typespec/compiler";
import { ClientKit } from "./client.js";

export interface NamespaceKit {
  /**
     * Get the namespaces below a given namespace that are used to generate the client library.
     
     * @param namespace namespace to get the children of
     */
  listSubNamespaces(): NamespaceKit[];

  /**
   * List all of the clients in a given namespace.
   *
   * @param namespace namespace to get the clients of
   */
  listClients(): ClientKit[];

  /**
   * List all of the models in a given namespace.
   *
   * @param namespace namespace to get the models of
   */
  listModels(): Model[];

  /**
   * List all of the enums in a given namespace.
   *
   * @param namespace namespace to get the enums of
   */
  listEnums(): Enum[];
}

export class NamespaceKitImpl implements NamespaceKit {
  private namespace: Namespace;

  constructor(namespace: Namespace) {
    this.namespace = namespace;
  }
  listSubNamespaces(): NamespaceKit[] {
    return [...this.namespace.namespaces.values()].map((n) => new NamespaceKitImpl(n));
  }

  listModels(): Model[] {
    return [...this.namespace.models.values()].map((m) => m);
  }

  listEnums(): Enum[] {
    return [...this.namespace.enums.values()];
  }

  listClients(): ClientKit[] {
    return [];
  }
}
