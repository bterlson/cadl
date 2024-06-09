import { Operation, Type, navigateType } from "@typespec/compiler";
import { InterfaceDeclaration } from "../../../typescript/interface-declaration.js";
import { InterfaceMember, TypeDeclaration } from "#typespec/emitter/typescript";
import { isDeclaration } from "../../../framework/utils/typeguards.js";

export interface ControllerInterfaceProps {
  command: Operation;
}

export function ControllerInterface({ command }: ControllerInterfaceProps) {
  const typeDecls = collectTypeDecls(command).map(type => (
    <TypeDeclaration type={type} />
  ));
  return <>
    <InterfaceDeclaration name="CommandInterface">
      <InterfaceMember type={command} />
    </InterfaceDeclaration>
    {typeDecls}
  </>
}

// todo: make this better.
function collectTypeDecls(root: Type) {
  const types: Type[] = [];
  navigateType(root, {
    model(m) {
      if (isDeclaration(m)) {
        types.push(m);
      }
    }
  }, {})

  return types;
}