import { Refkey, SymbolCreator } from "@alloy-js/core";
import { createPackage } from "@alloy-js/typescript";

// Explicit type, inferred type wasn't working
export const CLITable3: { default: Refkey } & SymbolCreator = createPackage({
  name: "cli-table3",
  version: "0.6.5",
  descriptor: {
    ".": {
      default: "Table",
    },
  },
});
