import { User, TodoItem, TodoAttachment, TodoItemPatch } from "./models/models.js";
import { TodoContext, TodoOptions, createTodoContext } from "./api/clientContext.js";
import { create } from "./api/users/operations.js";
import { list, create as create_2, get, update, delete_ } from "./api/todoItems/operations.js";
import { list as list_2, createAttachment } from "./api/todoItems/attachments/operations.js";

class Todo {
  todoItems: TodoItems;
  attachments: Attachments;
  users: Users;
    #context: TodoContext;
    constructor(endpoint: string, options?: TodoOptions) {
      this.#context = createTodoContext(endpoint, options)
        this.todoItems = new TodoItems(this.#context);
        this.attachments = new Attachments(this.#context);
        this.users = new Users(this.#context);
    }
    
    // extra methods go here  
}
class TodoItems {
  attachments: Attachments;
    #context: TodoContext;
    constructor(context: TodoContext) {
      this.#context = context
        this.attachments = new Attachments(this.#context);
    }
    list(options?: {
    "limit"?: number;
    "offset"?: number;
    
    }) {
      return list(this.#context, options);
    }
    
    create(item: TodoItem, contentType: "application/json", options?: {
    "attachments"?: (TodoAttachment)[];
    
    }) {
      return create_2(this.#context, item, contentType, options);
    }
    
    get(id: number) {
      return get(this.#context, id);
    }
    
    update(id: number, patch: TodoItemPatch, contentType: "application/merge-patch+json") {
      return update(this.#context, id, patch, contentType);
    }
    
    delete(id: number) {
      return delete_(this.#context, id);
    }
    this is added code!
}

class Attachments {
    
    #context: TodoContext;
    constructor(context: TodoContext) {
      this.#context = context
        
    }
    list(itemId: number) {
      return list_2(this.#context, itemId);
    }
    
    createAttachment(itemId: number, contents: TodoAttachment) {
      return createAttachment(this.#context, itemId, contents);
    }
    // extra methods go here  
}

class Users {
    
    #context: TodoContext;
    constructor(context: TodoContext) {
      this.#context = context
        
    }
    create(user: User) {
      return create(this.#context, user);
    }
    // extra methods go here  
}