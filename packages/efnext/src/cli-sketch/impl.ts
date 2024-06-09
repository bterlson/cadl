import { parseArgs } from "./tsp-output/@typespec/efnext/TodoCLI.js";

console.time("parse");
parseArgs(process.argv.slice(2), {
  version: "1.0.0-beta.1",
  TodoCLI() {},
  create(todoItem, color) {
    console.timeEnd("parse");
    console.log("Making todo item", todoItem);
  },
  update(id) {
    console.timeEnd("parse");
    console.log(`Updating ${id}`);
  },
});
