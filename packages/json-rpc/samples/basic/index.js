import express from "express";
import jsonmergepatch from "json-merge-patch";
import { expressAdapter } from "../../src/expressAdapter.js";
import { createTodosMarshaller } from "./tsp-output/@typespec/json-rpc/marshaller.js";
const allTodos = [];
let todoCount = 0;
function serializeTodoRead(todo) {
    return {};
}
const tdm = createTodosMarshaller({
    async createTodo(todo) {
        const newTodo = {
            id: "todo-" + todoCount++,
            updatedAt: new Date(),
            createdAt: new Date(),
            completed: false,
            ...todo,
        };
        allTodos.push(newTodo);
        return newTodo;
    },
    async getTodo(id) {
        const todo = allTodos.find((t) => t.id === id);
        if (!todo) {
            throw new Error("Todo not found.");
        }
        return todo; // TODO: slice unreadable properties?
    },
    async listTodos(filter = { includeCompleted: true }) {
        const todos = allTodos.filter((t) => {
            if (t.completed && !filter.includeCompleted) {
                return false;
            }
            return true;
        });
        return todos; // TODO: slice unreadable properties
    },
    async updateTodo(id, todoMergePatch) {
        const todo = allTodos.find((t) => t.id === id);
        if (!todo) {
            throw new Error("Todo not found.");
        }
        jsonmergepatch.apply(todo, todoMergePatch);
        return todo;
    },
});
const app = express();
app.use(express.json());
app.use("/api", expressAdapter(tdm));
app.listen(3000, () => {
    console.log("Listening...");
});
