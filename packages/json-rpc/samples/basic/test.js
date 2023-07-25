import { createMarshaller } from "./tsp-output/@typespec/json-rpc/marshaller.js";

const m = createMarshaller({
  createTodo(todo) {
    console.log("Creating!", todo);

    return {};
  },

  getTodo(id) {
    console.log("Getting id! ", id);
  },
});

m.getTodo({ id: "2a8f0725-9e0d-422c-8ee6-232a754b6c58" });
