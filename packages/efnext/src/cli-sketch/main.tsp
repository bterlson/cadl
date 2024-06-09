import "@typespec/efnext"; // just because it's crammed in here.

using TypeSpecCLI;

/**
 * This is a **really** awesome Todo CLI tool. It makes managing your todo items
 * a joy. So joyful you might cry.
 * 
 * # Usage
 * 
 * ```bash
 * todo-cli --help
 * todo-cli --title "This is a title" --description "This is a description"
 * ```
 */
@cli
interface TodoCLI {
  /**
   * Create a todo item.
   */
  op create(
    todoItem: TodoItem;
  
    /**
     * Whether to show color.
     */
    @invertable
    color?: boolean,
  ): void;

  /**
   * Update a todo item.
   */
  op update(
    id: string;
  ): void;
}


model TodoItem {
  /**
   * The todo item's title.
   */
  @short("t") title: string;
  /**
   * The todo item's description.
   */
  @short("d") description: string;
}