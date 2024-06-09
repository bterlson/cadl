import { parseArgs } from "./tsp-output/@typespec/efnext/test.js";

parseArgs(process.argv.slice(2), {
  version: "1.0.0-beta.1",
  Foo(todoItem, color) {
    console.log("Todo item", todoItem);
  },
});
