import "@typespec/json-rpc";
import "@typespec/json-schema";

using TypeSpec.JsonSchema;
using JsonRpc;

namespace TodoApp;

model Todo {
  @pattern("todo-\\d+")
  @visibility("read")
  id: string;

  @maxLength(100)
  title: string;

  @maxLength(255)
  description?: string;

  @visibility("read")
  createdAt: utcDateTime;

  @visibility("read")
  updatedAt: utcDateTime;

  @visibility("read", "update")
  completed: boolean;
}

@jsonRpc
interface Todos {
  @create createTodo(todo: Todo): Todo;
  @query getTodo(id: Todo.id): Todo;
  @query listTodos(
    filter?: {
      includeCompleted?: true;
    },
  ): Todo[];

  @update updateTodo(id: Todo.id, todo: Todo): Todo;
}

/*
// types.ts
export interface Todo {

}

export interface TodoCreate {
  
}

expoprt interface TodoMergePatch {

}

// api.ts
interface Todos {
  createTodo(todo: TodoCreate): Todo;
  getTodo(id: string): Todo;
  updateTodo(id: string, todo: TodoMergePatch): Todo;
  deleteTodo(id: string): boolean;
  listTodos(): Todo[]
}

export const host: {
  Todos: Todos
} = {
  Todos: {
    createTodo(todo: TodoCreate) {
      throw new Error("Not yet implemented");
    }
  }
}

// server code
host.Todos.createTodo = function(todo) {

}

// marshalling code
app.get("/", (req, res) => {
  // unpack envelope.
  host.Todos.
});

*/
