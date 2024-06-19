import {
  EmitContext,
  Enum,
  Model,
  Namespace,
  Operation,
  Type,
  navigateType,
} from "@typespec/compiler";
import { EmitOutput, SourceDirectory, SourceFile, emit } from "@typespec/efnext/framework";
import {
  InterfaceDeclaration,
  UnionDeclaration,
  typescriptNamePolicy,
} from "@typespec/efnext/typescript";
import { HttpOperation, HttpService, getAllHttpServices } from "@typespec/http";
import { RestClientDefinition } from "./components/rest-client-definition.js";
import { RestOperationParameter } from "./components/rest-operation-parameter.js";
import { RestResource } from "./components/rest-resource.js";
import { HelperContext, StateHelpers, getStateHelpers } from "./helpers/helpers.js";

export async function $onEmit(context: EmitContext) {
  if (context.program.compilerOptions.noEmit) {
    return;
  }

  const tree = emitRlc(context);
  return emit(context, tree);
}

export function emitRlc(context: EmitContext) {
  const helpers = getStateHelpers(context);
  const { restResources, models, parameters, enums, responses, httpService } = queryProgram(
    context,
    helpers
  );

  const resources = Array.from(restResources.entries());
  return (
    <EmitOutput namePolicy={typescriptNamePolicy}>
      <HelperContext.Provider value={helpers}>
        <SourceDirectory path="src">
          <SourceFile path="parameters.ts" filetype="typescript">
            {parameters.map((model) => {
              return <RestOperationParameter type={model} />;
            })}
          </SourceFile>
          <SourceFile path="models.ts" filetype="typescript">
            {enums.map((e) => (
              <UnionDeclaration type={e} />
            ))}
            {models.map((model) => {
              return <InterfaceDeclaration type={model} />;
            })}
          </SourceFile>
          <SourceFile path="responses.ts" filetype="typescript">
            {responses.map((model) => {
              return <InterfaceDeclaration type={model} />;
            })}
          </SourceFile>
          <SourceFile path="clientDefinitions.ts" filetype="typescript">
            <InterfaceDeclaration name="Routes">
              {resources.map(([path, operations]) => (
                <RestResource path={path} operations={operations} />
              ))}
            </InterfaceDeclaration>
            <RestClientDefinition httpType={httpService} />
          </SourceFile>
        </SourceDirectory>
      </HelperContext.Provider>
    </EmitOutput>
  );
}

interface RlcRecord {
  restResources: Map<string, HttpOperation[]>;
  models: Model[];
  enums: Enum[];
  parameters: Model[];
  responses: Model[];
  httpService: HttpService;
}

function queryProgram({ program }: EmitContext, helpers: StateHelpers): RlcRecord {
  const services = getAllHttpServices(program)[0];
  if (services.length === 0) {
    throw new Error("No service found");
  }

  const service = services[0];
  const modelsInventory = new Map<Namespace, Type[]>();
  const enumsInventory = new Map<Namespace, Enum[]>();

  // find all models within the service namespace
  // and organize them by the namespace they're in.
  navigateType(
    service.namespace,
    {
      model(m) {
        if (m.namespace?.name === "TypeSpec") {
          return;
        }

        if (!modelsInventory.get(m.namespace!)) {
          modelsInventory.set(m.namespace!, []);
        }

        const ms = modelsInventory.get(m.namespace!)!;
        ms.push(m);
      },
      enum(e) {
        if (e.namespace?.name === "TypeSpec") {
          return;
        }

        if (!enumsInventory.get(e.namespace!)) {
          enumsInventory.set(e.namespace!, []);
        }

        const ms = enumsInventory.get(e.namespace!)!;
        ms.push(e);
      },
    },
    {}
  );

  const models = [...modelsInventory.values()].flat() as Model[];
  const mutatedModels = models
    .map((model) => {
      const { type } = helpers.toVisibilityModel(model);
      if (type === model) {
        return undefined;
      }

      return type;
    })
    .filter((m) => m !== undefined) as Model[];

  models.push(...mutatedModels);

  const httpOperations = service.operations.map((httpOperation) => {
    const mutated = helpers.toRestOperation(httpOperation.operation);
    const operation = mutated.type as Operation;
    return {
      ...httpOperation,
      operation,
    };
  });

  const restResources = groupByPath(httpOperations);
  const enums = [...enumsInventory.values()].flat() as Enum[];
  const parameters = Array.from(helpers.getVisitedTypes().get("parameter") ?? []) as Model[];
  const responses = Array.from(helpers.getVisitedTypes().get("response") ?? []) as Model[];

  return {
    restResources,
    models,
    enums,
    parameters,
    responses,
    httpService: service,
  };
}

function groupByPath(operations: HttpOperation[]): Map<string, HttpOperation[]> {
  return operations.reduce((acc, operation) => {
    if (!acc.has(operation.path)) {
      acc.set(operation.path, []);
    }
    acc.get(operation.path)!.push(operation);
    return acc;
  }, new Map<string, HttpOperation[]>());
}
