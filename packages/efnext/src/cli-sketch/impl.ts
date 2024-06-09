import { parseArgs } from "./tsp-output/@typespec/efnext/test.js";

parseArgs(process.argv.slice(2), {
  Foo(todoItem, color) {
    console.log("Todo item", todoItem);
  },
});
