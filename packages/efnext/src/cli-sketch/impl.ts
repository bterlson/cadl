import { parseArgs } from "./tsp-output/@typespec/efnext/TodoCLI.js";

parseArgs(process.argv.slice(2), {
  version: "1.0.0-beta.1",
  TodoCLI(todoItem, color) {
    console.log("Todo item", todoItem);
  },
});
