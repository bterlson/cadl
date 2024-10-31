import { code, rename, replace, resolveFQN } from "@alloy-js/core";
import { ExtraClientMethodsSlot } from "./components/client.jsx";

const listFn = resolveFQN("test-package.src/client_ts.TodoItemsClient#list");
rename(listFn, "listItems");

const todoItemClientSlot = ExtraClientMethodsSlot.find(
  "test-package.src/client_ts.TodoItemsClient",
);

replace(todoItemClientSlot, (props) => {
  return code`
    function foo() {
      console.log("hello world");
    }
  `;
});
