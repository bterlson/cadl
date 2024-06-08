import { parseArgs } from "./tsp-output/@typespec/efnext/test.js";

parseArgs(process.argv.slice(2), {
  Foo(string, stringDefaulted, boolean) {
    console.log(`Foo invoked with `, { string, stringDefaulted, boolean });
  },
});
