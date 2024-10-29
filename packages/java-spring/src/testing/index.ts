import { resolvePath } from "@typespec/compiler";
import { createTestLibrary, TypeSpecTestLibrary } from "@typespec/compiler/testing";
import { fileURLToPath } from "url";

export const JavaSpringTestLibrary: TypeSpecTestLibrary = createTestLibrary({
  name: "java-spring",
  packageRoot: resolvePath(fileURLToPath(import.meta.url), "../../../"),
});
