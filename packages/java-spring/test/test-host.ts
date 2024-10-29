import { Diagnostic, Program } from "@typespec/compiler";
import {
  BasicTestRunner,
  createTestHost,
  createTestWrapper,
  expectDiagnosticEmpty,
} from "@typespec/compiler/testing";
import { HttpTestLibrary } from "@typespec/http/testing";
import { RestTestLibrary } from "@typespec/rest/testing";
import { join, relative } from "path";
import { JavaSpringTestLibrary } from "../src/testing/index.js";

export async function createJavaSpringTestHost() {
  return createTestHost({
    libraries: [JavaSpringTestLibrary, HttpTestLibrary, RestTestLibrary],
  });
}

export async function createJavaSpringTestRunner() {
  const host = await createJavaSpringTestHost();

  return createTestWrapper(host, {
    autoImports: ["@typespec/http", "@typespec/rest"],
    autoUsings: ["TypeSpec.Http", "TypeSpec.Rest"],
    compilerOptions: {
      noEmit: false,
      emit: ["java-spring"],
    },
  });
}

const emitterOutputDir = join("tsp-output", "java-spring");

export async function emitWithDiagnostics(
  code: string,
): Promise<[Record<string, string>, readonly Diagnostic[]]> {
  const runner = await createJavaSpringTestRunner();
  await runner.compileAndDiagnose(code, {
    outputDir: "tsp-output",
  });
  const result = await readFilesRecursively(emitterOutputDir, runner);
  return [result, runner.program.diagnostics];
}

async function readFilesRecursively(
  dir: string,
  runner: BasicTestRunner,
): Promise<Record<string, string>> {
  const entries = await runner.program.host.readDir(dir);
  const result: Record<string, string> = {};

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = await runner.program.host.stat(fullPath);

    if (stat.isDirectory()) {
      // Recursively read files in the directory
      const nestedFiles = await readFilesRecursively(fullPath, runner);
      Object.assign(result, nestedFiles);
    } else if (stat.isFile()) {
      // Read the file
      // Read the file and store it with a relative path
      const relativePath = relative(emitterOutputDir, fullPath);
      const fileContent = await runner.program.host.readFile(fullPath);
      result[relativePath] = fileContent.text;
    }
  }

  return result;
}

/**
 * Emit TypeSpec file and return record of emitted files and contents. Best for full integration tests
 *
 * @param code TypeSpec code
 */
export async function emit(code: string): Promise<Record<string, string>> {
  const [result, diagnostics] = await emitWithDiagnostics(code);
  expectDiagnosticEmpty(diagnostics);
  return result;
}

/**
 * Render TypeSpec program so we can extract types to test individual components
 */
export async function getProgram(code: string): Promise<Program> {
  const wrapper = await createJavaSpringTestRunner();
  const [_, diagnostics] = await wrapper.compileAndDiagnose(code);
  expectDiagnosticEmpty(diagnostics);
  return wrapper.program;
}
