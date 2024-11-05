import { code, replace } from "@alloy-js/core";
import { ExtraClientMethodsSlot } from "./components/client.jsx";

const todoItemClientSlot = ExtraClientMethodsSlot.find({
  name: "test-package.src/client_ts.TodoItems",
});

replace(todoItemClientSlot, (props) => {
  return code`
    this is added code!
  `;
});
