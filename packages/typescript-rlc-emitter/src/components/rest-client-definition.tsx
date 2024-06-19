import {
  Block,
  IntersectionConstituent,
  IntersectionDeclaration,
  Reference,
} from "@typespec/efnext/typescript";
import { HttpService } from "@typespec/http";
import { pascalCase } from "change-case";
import { coreLib } from "./external-refs.js";

export interface RestClientDefinitionProps {
  httpType: HttpService;
  name?: string;
}

export function RestClientDefinition({ httpType, name }: RestClientDefinitionProps) {
  const serviceClientName = pascalCase(`${httpType.namespace.name}Client`);
  const clientName = name ?? serviceClientName;
  return (
    <IntersectionDeclaration name={clientName}>
      <IntersectionConstituent>
        <Reference builtin={coreLib.httpRuntime.Client} />
      </IntersectionConstituent>
      <Block>path: Routes</Block>
    </IntersectionDeclaration>
  );
}
