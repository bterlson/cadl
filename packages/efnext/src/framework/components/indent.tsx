import { ComponentChildren } from "#jsx/jsx-runtime";
import { createContext, useContext } from "../core/context.js";
import { printChildren } from "../core/render.js";
import { usePrinter } from "../core/use-printer.js";

export const IndentContext = createContext<IndentState>();

export interface IndentProps {
  children?: ComponentChildren;
  indent?: string;
}

export interface IndentState {
  level: number;
  indent: string;
}

export function Indent({ indent, children }: IndentProps) {
  const previousIndent = useContext(IndentContext) ?? {
    level: 0,
    indent: indent ?? "  ",
  };

  const currentIndent = {
    level: previousIndent.level + 1,
    indent: indent ?? previousIndent.indent,
  };

  usePrinter((node) => {
    const text = printChildren(node);
    const indented = text
      .split("\n")
      .map((l) => (l.trim().length === 0 ? l : currentIndent.indent + l))
      .join("\n");
    return indented;
  });

  return <IndentContext.Provider value={currentIndent}>{children}</IndentContext.Provider>;
}
