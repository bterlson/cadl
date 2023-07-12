import "@typespec/json-api";
import "@typespec/json-schema";

using JsonSchema;
using JsonRpc;

@JsonSchema("https://mydemotodoapp.com")
namespace TodoApp;

model Todo {
  @format("uuid")
  @visibility("read")
  id: string;

  @maxLength(100)
  title: string;

  @visibility("read")
  createdAt: zonedDateTime;

  @visibility("read")
  updatedAt: zonedDateTime;

  // date update fields
  completed: boolean;

  active: boolean;
}

@jsonRpc
interface Todos {
  @create createTodo(todo: Todo): Todo;
  @query getTodo(id: Todo.id): Todo;
  @update updateTodo(id: Todo.id, todo: Todo): Todo;
  @delete deleteTodo(id: Todo.id): void;
  @query listTodos(): Todo[];
  //@event newTodo(): Todo;
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
