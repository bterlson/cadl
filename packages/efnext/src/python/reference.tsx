import { ScopeContext } from "../framework/components/scope.js";
import { SourceFileContext } from "../framework/components/source-file.js";
import { useContext } from "../framework/core/context.js";

export interface ReferenceProps {
  refkey?: unknown;
  builtin?: readonly [string, string] | [string, string];
}
export async function Reference({ refkey, builtin }: ReferenceProps) {
  const sourceFile = useContext(SourceFileContext);

  if (builtin) {
    sourceFile!.addImport({ importPath: builtin[0], name: builtin[1]});
    return builtin[1];
  }
  
  const scope = useContext(ScopeContext);
  if (!scope) {
    throw new Error("Need scope context to form references");
  }
  const binder = scope.binder;

  const result = await binder.resolveOrWaitForDeclaration(scope, refkey);
  if (!result.resolved) {
    throw new Error("Failed to resolve");
  }

  const { targetDeclaration, pathDown } = result;
  if (pathDown.length > 0 && pathDown[0].kind === "module") {
    // TODO update import
    sourceFile!.addImport({ importPath: pathDown[0].path, name: targetDeclaration.name });
  }

  return targetDeclaration.name;
}
