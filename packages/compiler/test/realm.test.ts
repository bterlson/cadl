/*
interface StateContext {
  program: Program;
  realm?: Realm;
}
function createColorDecorators(host: TestHost, runner: BasicTestRunner) {
  const libDef = createTypeSpecLibrary({
    name: "colors",
    diagnostics: {},
  });

  const blueKey = libDef.createStateSymbol("colors");

  const defs = {
    isBlue(context: StateContext, t: Type): boolean {
      return !!state(context, blueKey).get(t);
    },
    $blue(context: DecoratorContext, target: Type) {
      state(context, blueKey).set(target, true);
    },
    context: createContext,
    blueKey,
  };

  host.addJsFile("colors.js", defs);

  return defs;

  function createContext(realm?: Realm): StateContext {
    return {
      program: runner.program,
      realm,
    };
  }
}

function cloneIntoRealm<T extends Type>(runner: BasicTestRunner, target: T) {
  const realm = new Realm(runner.program, "test realm");
  const clone = realm.clone(target) as T;
  return { realm, clone };
}

describe("compiler: realm", () => {
  let host: TestHost;
  let runner: BasicTestRunner;
  let decs: ReturnType<typeof createColorDecorators>;

  beforeEach(async () => {
    host = await createTestHost();
    runner = createTestWrapper(host, {
      autoImports: ["./colors.js"],
    });
    decs = createColorDecorators(host, runner);
  });

  describe("compiler: realm: clone", () => {
    it("clones models", async () => {
      const code = `
        @test model Bar { }
        @test model Foo { x: Bar };
      `;

      const { Foo, Bar } = (await runner.compile(code)) as { Foo: Model; Bar: Model };
      const { realm, clone: shadowFoo } = cloneIntoRealm(runner, Foo);

      assert.notStrictEqual(Foo, shadowFoo, "creates a clone of models");
      assert(shadowFoo.properties.has("x"), "the clone has the right members");
      assert.strictEqual(
        Foo.properties.get("x"),
        shadowFoo.properties.get("x"),
        "doesn't clone model properties"
      );
      assert.strictEqual(shadowFoo.properties.get("x")!.type, Bar, "doesn't clone member types");

      assert(realm.hasType(shadowFoo), "shadowFoo is in the realm");
      assert(
        !realm.hasType(shadowFoo.properties.get("x")!),
        "shadowFoo's x prop is not in the realm"
      );
      assert(!realm.hasType(Foo), "Foo is not in the realm");
      assert(!realm.hasType(Bar), "Bar is not in the realm");
    });

    it("handles cloned state", async () => {
      const code = `
        @blue @test model Bar { }
        @blue @test model Foo { x: Bar };
      `;

      const { Foo, Bar } = (await runner.compile(code)) as { Foo: Model; Bar: Model };
      const { realm, clone: shadowFoo } = cloneIntoRealm(runner, Foo);
      const context = decs.context(realm);
      assert(Foo !== shadowFoo, "shadowFoo is actually a clone");
      assert(!decs.isBlue(context, Foo), "Foo is not blue");
      assert(decs.isBlue(context, Bar), "Bar is blue");
      assert(decs.isBlue(context, shadowFoo), "shadowFoo is blue");

      const realmItems = new Set([...state(context, decs.blueKey).keys()]);
      assert(!realmItems.has(Foo), "realm state does not have Foo");
      assert(realmItems.has(Bar), "realm state has Bar");
      assert(realmItems.has(shadowFoo), "realm state has shadowFoo");

      const mainItems = new Set([...state({ ...context, realm: undefined }, decs.blueKey).keys()]);
      assert(mainItems.has(Bar), "main state has Bar");
      assert(mainItems.has(Foo), "main state has Foo");
      assert(!mainItems.has(shadowFoo), "main state does not have shadowFoo");
    });
  });
});

describe("compiler: VisibilityRealm", () => {
  let host: TestHost;
  let runner: BasicTestRunner;

  class VisibilityRealm extends Realm {
    constructor(program: Program, visibility: string) {
      super(program, `Visibility[${visibility}]`, [Mutators.Visibility.read]);
    }
  }

  beforeEach(async () => {
    host = await createTestHost();
    runner = createTestWrapper(host);
  });

  it("recursively clones into the realm, removing non-visible properties", async () => {
    const code = `
      @test model Foo {
        @visibility("create") x: string;
        @visibility("read") y: Bar;
      };

      @test model Bar {
        @visibility("create") x: string;
        @visibility("read") y: string;
      }
    `;

    const { Foo, Bar } = (await runner.compile(code)) as { Foo: Model; Bar: Model };
    const realm = new VisibilityRealm(runner.program, "read");
    const shadowFoo = realm.clone(Foo);
    const shadowBar = realm.map(Bar)!;

    assert.strictEqual(shadowFoo.properties.size, 1);
    assert(shadowFoo.properties.has("y"));
    assert(!shadowFoo.properties.has("x"));
    assert(realm.updatesType(Foo.properties.get("x")!));
    assert(!realm.updatesType(Foo.properties.get("y")!));

    assert.strictEqual(shadowBar.properties.size, 1);
    assert(shadowBar.properties.has("y"));
    assert(!shadowBar.properties.has("x"));
    assert(realm.updatesType(Bar.properties.get("x")!));
    assert(!realm.updatesType(Bar.properties.get("y")!));
  });
});

describe("Compiler: update and JSON Merge Patch realm", () => {
  let host: TestHost;
  let runner: BasicTestRunner;

  beforeEach(async () => {
    host = await createTestHost();
    runner = createTestWrapper(host);
  });

  it("recursively clones into the realm, removing non-visible properties", async () => {
    const code = `
      @test model Foo {
        @visibility("create") x: string;
        y: Bar;
        z?: string;
      };

      @test model Bar {
        @visibility("create") deleted: string;
        x: string;
        y?: string;
      }
    `;

    const { Foo, Bar } = (await runner.compile(code)) as { Foo: Model; Bar: Model };
    const realm = new Realm(runner.program, "update and merge", [
      Mutators.Visibility.update,
      Mutators.JSONMergePatch,
    ]);
    const shadowFoo = realm.clone(Foo);
    const shadowBar = realm.map(Bar)!;

    assert(shadowFoo.name === "FooUpdateMergePatch", "shadowFoo name");
    assert(!shadowFoo.properties.has("x"), "shadowFoo doesn't have x");
    assert(shadowFoo.properties.get("y")!.optional, "shadowFoo y is optional");
    assert(shadowFoo.properties.get("y")!.type === Bar, "shadowFoo's y type is Bar");
    assert(shadowFoo.properties.get("z")!.optional, "shadowFoo z is optional");
    assert(shadowFoo.properties.get("z")!.type.kind === "Union", "shadowFoo z is a union");
    const zVariants = [...(shadowFoo.properties.get("z")!.type as Union).variants.values()];
    assert(
      zVariants[0].type === runner.program.checker.getStdType("string"),
      "z's union has string"
    );
    assert(zVariants[1].type === runner.program.checker.nullType, "z's union has null");

    assert(shadowBar.name === "BarUpdateMergePatch", "shadowBar name");
    assert(shadowBar.properties.get("x")!.optional, "shadowBar x is optional");
    assert(
      shadowBar.properties.get("x")!.type === runner.program.checker.getStdType("string"),
      "shadowBar type is string"
    );
  });
});
*/
