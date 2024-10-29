import { createTypeSpecLibrary } from "@typespec/compiler";

export const $lib = createTypeSpecLibrary({
  name: "java-spring",
  diagnostics: {},
});

export const { reportDiagnostic, createDiagnostic } = $lib;
