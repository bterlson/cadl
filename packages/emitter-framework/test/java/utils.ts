import { Children, OutputDirectory, OutputFile, render } from "@alloy-js/core";
import { Output } from "@alloy-js/core/stc";
import { createJavaNamePolicy, javaUtil } from "@alloy-js/java";
import { PackageDirectory, SourceFile } from "@alloy-js/java/stc";
import { Program } from "@typespec/compiler";
import { getProgram } from "./test-host.js";

export async function getEmitOutput(tspCode: string, cb: (program: Program) => Children) {
  const program = await getProgram(tspCode);

  const res = render(
    Output({ namePolicy: createJavaNamePolicy(), externals: [javaUtil] }).children(
      PackageDirectory({ package: "me.test.code" }).children(
        SourceFile({ path: "Test.java" }).children(cb(program)),
      ),
    ),
  );
  const testFile = findFile(res, "Test.java");

  return testFile.contents;
}

/**
 * Children will be passed to the package directory, have to declare source file yourself.
 * Useful util if needing to emit multiple files for the test
 */
export async function getMultiEmitOutput(
  tspCode: string,
  cb: (program: Program) => Children,
  testFileName: string = "Test.java",
) {
  const program = await getProgram(tspCode);

  const res = render(
    Output({ namePolicy: createJavaNamePolicy(), externals: [javaUtil] }).children(
      PackageDirectory({ package: "me.test.code" }).children(cb(program)),
    ),
  );
  const testFile = findFile(res, testFileName);

  return testFile.contents;
}

export function findFile(res: OutputDirectory, path: string): OutputFile {
  const result = findFileWorker(res, path);

  if (!result) {
    throw new Error("Expected to find file " + path);
  }
  return result;

  function findFileWorker(res: OutputDirectory, path: string): OutputFile | null {
    for (const item of res.contents) {
      if (item.kind === "file") {
        if (item.path.includes(path)) {
          return item;
        }
      } else {
        const found = findFileWorker(item, path);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }
}
