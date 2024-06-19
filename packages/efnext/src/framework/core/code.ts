import { ComponentChildren, jsx } from "#jsx/jsx-runtime";
import { Indent } from "../components/indent.js";

const startWhitespaceRe = /^\s*/;
const endWhitespaceRe = /[\r\n]+\s*$/;
const endIndentRe = /[ \t]*$/;

/**
 * This tagged template function takes literal strings and component substitutions
 * and handles indent state and merging the literal strings with substitutions into
 * ComponentChildren that can be nested within a JSX template.
 */
export function code(strs: TemplateStringsArray, ...subs: ComponentChildren[]): ComponentChildren {
  // dedent...
  const children: ComponentChildren = [];

  if (strs[0][0] !== "\n") {
    throw new Error("Code template must begin with a line break");
  }

  const processedStrs = [strs[0].slice(1), ...strs.slice(1, -1)];
  if (strs.length > 1) {
    processedStrs.push(strs[strs.length - 1].replace(/[\r\n\s]+$/, ""));
  }
  const firstLineIndent = processedStrs[0].match(startWhitespaceRe)![0];
  const result = processTemplateString(processedStrs[0], firstLineIndent);
  let subIndent = result.indent;
  children.push(result.trimmed);

  for (let i = 0; i < subs.length; i++) {
    const item = subs[i];
    children.push(jsx(Indent, { indent: subIndent, children: item }));
    const result = processTemplateString(processedStrs[i + 1], firstLineIndent);
    subIndent = result.indent;
    children.push(result.trimmed);
  }

  return children;
}

function processTemplateString(str: string, firstLineIndent: string) {
  str = dedent(str, firstLineIndent);
  const lastLineIndentMatch = str.match(endWhitespaceRe);
  if (lastLineIndentMatch) {
    return {
      indent: str.match(endIndentRe)![0],
      trimmed: str.replace(endIndentRe, ""),
    };
  } else {
    return { indent: "", trimmed: str };
  }
}
function dedent(str: string, firstLineIndent: string) {
  const lines = str.split("\n");
  const dedentedLines = lines.map((line) =>
    line.startsWith(firstLineIndent) ? line.slice(firstLineIndent.length) : line
  );

  return dedentedLines.join("\n");
}
