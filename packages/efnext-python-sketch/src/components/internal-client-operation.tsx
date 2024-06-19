import { Operation } from "@typespec/compiler";
import { getRefkey, useNamePolicy } from "@typespec/efnext/framework";
import { Function } from "@typespec/efnext/python";

export interface InternalClientOperationProps {
  operation: Operation;
}
/**
 * Emits an internal thing that will eventually have a declaration.
 */
export function InternalClientOperation({ operation }: InternalClientOperationProps) {
  const namer = useNamePolicy();
  const name = `_` + namer.getName(operation, "function");
  return (
    <Function type={operation} name={name} refkey={getRefkey(operation, "internal")}>
      raise NotImplementedError
    </Function>
  );
}
