import { Children, OutputDirectory, OutputFile, render } from "@alloy-js/core";
import { Output } from "@alloy-js/core/stc";
import { javaUtil } from "@alloy-js/java";
import { PackageDirectory, SourceFile } from "@alloy-js/java/stc";
import { Program } from "@typespec/compiler";
import { springFramework } from "../src/spring/libraries/index.js";
import { getProgram } from "./test-host.js";

/**
 * Emit TypeSpec code to test output in a single file. Injects all java context needed
 */
export async function getEmitOutput(tspCode: string, cb: (program: Program) => Children) {
  const program = await getProgram(tspCode);

  const res = render(
    Output({ externals: [javaUtil, springFramework] }).children(
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
 * Useful util if needing to emit multiple files for a unit test
 */
export async function getMultiEmitOutput(
  tspCode: string,
  cb: (program: Program) => Children,
  testFileName: string = "Test.java",
) {
  const program = await getProgram(tspCode);

  const res = render(
    Output().children(PackageDirectory({ package: "me.test.code" }).children(cb(program))),
  );
  const testFile = findFile(res, testFileName);

  return testFile.contents;
}

/**
 * When running full emitter test, lookup file by package and name
 */
export function findEmittedFile(res: Record<string, string>, path: string): string {
  const result = findFileWorker(res, path);

  if (!result) {
    throw new Error("Expected to find file " + path);
  }
  return result;

  function findFileWorker(res: Record<string, string>, path: string): string | null {
    for (const key in res) {
      // Replace path separator with '.', so we can do a package lookup like 'me.test.code.MyClassFile.java'
      const newPath = key.replaceAll(/[\\/]/g, ".");
      if (newPath.includes(path)) {
        return res[key];
      }
    }
    return null;
  }
}

/**
 * Find file from Alloy output
 */
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
        continue;
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
