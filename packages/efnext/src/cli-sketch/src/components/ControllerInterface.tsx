import { Operation } from "@typespec/compiler";
import { InterfaceDeclaration } from "../../../typescript/interface-declaration.js";
import { InterfaceMember } from "#typespec/emitter/typescript";

export interface ControllerInterfaceProps {
  command: Operation;
}

export function ControllerInterface({ command }: ControllerInterfaceProps) {
  return (
    <InterfaceDeclaration name="CommandInterface">
      <InterfaceMember type={command} />
    </InterfaceDeclaration>
  )
}