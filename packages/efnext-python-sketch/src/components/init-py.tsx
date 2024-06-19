import { code } from "@typespec/compiler/emitter-framework";
import { useNamePolicy } from "@typespec/efnext/framework";
import { AppFolderRecord } from "./app-folder.js";

export interface InitPyProps {
  folder: AppFolderRecord;
}
/**
 * Creates an InitPy for a folder.
 * Todo: could be more generalized by using <Reference> to get the type names, which would
 * allow us to change the emitting names at any point.
 */
export function InitPy({ folder }: InitPyProps) {
  const namer = useNamePolicy();
  let imports = [];
  let all = [];

  for (const subfolder of folder.subfolders) {
    imports.push(`from .${subfolder.path} import *`);
    all.push(subfolder.path);
  }

  if (folder.types.length > 0) {
    const typeNames = folder.types.map((t) => namer.getName(t, "class"));
    imports.push(`from models import ${typeNames.join(",")}`);
    all = all.concat(typeNames);
  }

  if (folder.operations.length > 0) {
    const opNames = folder.operations.map((t) => namer.getName(t, "function"));
    imports.push(`from operations import ${opNames.join(",")}`);
    all = all.concat(opNames);
  }

  return code`
    ${imports.join("\n")}
    
    __all__ = [
      ${all.map((v) => `"${v}"`).join("\n") /**Probably need to fix this in code? */}
    ]

  `;
}
