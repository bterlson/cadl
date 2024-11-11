import { createTypeSpecLibrary } from "@typespec/compiler";

export const $lib = createTypeSpecLibrary({
  name: "sketch-english",
  diagnostics: {},
});

export const { reportDiagnostic, createDiagnostic } = $lib;
