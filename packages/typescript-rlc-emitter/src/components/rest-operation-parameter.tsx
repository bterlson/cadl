import { Model } from "@typespec/compiler";
import { ComponentChildren } from "@typespec/efnext/jsx-runtime";
import {
  IntersectionConstituent,
  IntersectionDeclaration,
  Reference,
} from "@typespec/efnext/typescript";
import { coreLib } from "./external-refs.js";

export interface RestOperationParameterProps {
  type: Model;
  children?: ComponentChildren;
}

export function RestOperationParameter({ type }: RestOperationParameterProps) {
  return (
    <IntersectionDeclaration type={type}>
      <IntersectionConstituent>
        <Reference builtin={coreLib.httpRuntime.RequestOptions} />
      </IntersectionConstituent>
    </IntersectionDeclaration>
  );
}
