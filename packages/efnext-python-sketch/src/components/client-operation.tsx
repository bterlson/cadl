import { Operation } from "@typespec/compiler";
import { getRefkey } from "@typespec/efnext/framework";
import { Function, Reference } from "@typespec/efnext/python";

interface ClientOperationProps {
  operation: Operation;
}

/**
 * Emits a function that now just calls out to the internal one.
 *
 * Todo: currently hardcodes list, but presumably this should be dynamically imported.
 * Need to support so that line is no longer necessary.
 */
export function ClientOperation({ operation }: ClientOperationProps) {
  return (
    <Function type={operation}>
      return <Reference refkey={getRefkey(operation, "internal")} />
    </Function>
  );
}
