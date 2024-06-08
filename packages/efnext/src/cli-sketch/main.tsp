import "@typespec/efnext"; // just because it's crammed in here.

using TypeSpecCLI;

op Foo(
  /**
   * This is a test string!
   */
  @short("s")
  string: string,

  @short("d")
  stringDefaulted: string = "most def!",

  /**
   * This is an optional boolean!
   */
  @short("b")
  @invertable
  boolean: boolean,
): void;
