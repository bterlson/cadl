import "@typespec/efnext"; // just because it's crammed in here.

using TypeSpecCLI;

/**
 * This is a **really** awesome CLI tool.
 * 
 * # Usage
 * 
 * ```bash
 * foo --help
 * foo --string "hello" -b --hello -- testing testing testing
 * ```
 */
op Foo(
  todoItem: TodoItem;
  @short("b")
  @invertable
  color?: boolean,
): void;

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