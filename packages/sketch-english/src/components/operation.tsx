import * as ay from "@alloy-js/core";
import { Operation } from "@typespec/compiler";
import { $ } from "@typespec/compiler/typekit";
import { OperationComponent, useOperationContext } from "../utils/contexts/operation-context.jsx";
import { getEnglishTypeName } from "../utils/utils.js";
import { EnglishProp } from "./prop.js";

export interface OperationProps {
  operation: Operation;
}

export function EnglishOperation(props: OperationProps) {
  const operationContext = useOperationContext();
  return (
    <OperationComponent operation={props.operation}>
      Operation "{props.operation.name}"
      <ay.Indent>
        {ay.mapJoin(
          operationContext.getClientSignature(),
          (prop) => (
            <EnglishProp prop={prop} />
          ),
          { joiner: "\n" },
        )}
      </ay.Indent>
      <ay.Indent>
        Return type "{getEnglishTypeName($.operation.getValidReturnType(props.operation))}"
      </ay.Indent>
    </OperationComponent>
  );
}
