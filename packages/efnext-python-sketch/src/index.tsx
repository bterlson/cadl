import {
  EmitContext,
  Enum,
  Model,
  Namespace,
  Program,
  Type,
  Union,
  navigateType,
} from "@typespec/compiler";
import { EmitOutput, emit } from "@typespec/efnext/framework";
import { pythonNamePolicy } from "@typespec/efnext/python";
import { getAllHttpServices } from "@typespec/http";
import { AppFolder, AppFolderRecord } from "./components/app-folder.js";

export async function $onEmit(context: EmitContext) {
  if (context.program.compilerOptions.noEmit) {
    return;
  }

  // queryApp walks the type graph and assembles the AppFolder structure.
  const rootFolder = queryApp(context);
  await emit(
    context,
    <EmitOutput namePolicy={pythonNamePolicy}>
      <AppFolder folder={rootFolder} />
    </EmitOutput>
  );
}

// use compiler APIs to assemble this structure.
function queryApp({ program }: EmitContext) {
  // todo: ignoring diagnostics for now
  const services = getAllHttpServices(program)[0];
  if (services.length === 0) {
    throw new Error("No service found");
  }

  const service = services[0];
  const models = new Map<Namespace, Type[]>();

  // find all models within the service namespace
  // and organize them by the namespace they're in.
  function emitType(type: Model | Enum | Union) {
    if (!models.get(type.namespace!)) {
      models.set(type.namespace!, []);
    }

    const ms = models.get(type.namespace!)!;
    ms.push(type);
  }

  navigateType(
    service.namespace,
    {
      model: emitType,
      enum: emitType,
      union: emitType,
    },
    {}
  );

  return getFolderForNamespace(program, service.namespace, "./", models);
}

function getFolderForNamespace(
  program: Program,
  namespace: Namespace,
  path: string,
  models: Map<Namespace, Type[]>
): AppFolderRecord {
  const rootFolder: AppFolderRecord = {
    path,
    types: findTypesInNamespace(namespace, models),
    moduleName: namespace.name,
    operations: [...namespace.operations.values()],
    subfolders: [...namespace.namespaces.values()].map((n) =>
      getFolderForNamespace(program, n, n.name, models)
    ),
  };

  return rootFolder;
}

function findTypesInNamespace(root: Namespace, models: Map<Namespace, Type[]>) {
  return (models.get(root) as Model[]) ?? [];
}
