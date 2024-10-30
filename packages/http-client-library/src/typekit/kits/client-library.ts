import { $, defineKit } from "@typespec/compiler/typekit";
import { NamespaceKit, NamespaceKitImpl } from "./namespace.js";

interface ClientLibraryKit {
  for(emitterName: string): ListNamespacesKit;
}

interface ListNamespacesKit {
  listNamespaces(): NamespaceKit[];
}

interface Typekit {
  clientLibrary: ClientLibraryKit;
}

declare module "@typespec/compiler/typekit" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TypekitPrototype extends Typekit {}
}

class ListNamespacesKitImpl implements ListNamespacesKit {
  private emitterName: string;

  constructor(emitterName: string) {
    this.emitterName = emitterName;
  }

  listNamespaces(): NamespaceKit[] {
    return [...$.program.checker.getGlobalNamespaceType().namespaces.values()].map((n) => {
      return new NamespaceKitImpl(n);
    });
  }
}

defineKit<Typekit>({
  clientLibrary: {
    for(emitterName: string): ListNamespacesKit {
      return new ListNamespacesKitImpl(emitterName);
    },
  },
});
