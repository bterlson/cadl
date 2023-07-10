import { compilerAssert, navigateType } from "../index.js";
import { applyDecoratorsToType } from "./checker.js";
import { Mutator, MutatorRecord } from "./mutators.js";
import { Program } from "./program.js";
import { createTypeFactory } from "./type-factory.js";
import { SemanticNodeListener, Type } from "./types.js";

class StateMapRealmView<V> implements Map<Type, V> {
  #realm: Realm;
  #parentState: Map<Type, V>;
  #realmState: Map<Type, V>;

  public constructor(realm: Realm, realmState: Map<Type, V>, parentState: Map<Type, V>) {
    this.#realm = realm;
    this.#parentState = parentState;
    this.#realmState = realmState;
  }

  has(t: Type) {
    return this.dispatch(t).has(t) ?? false;
  }

  set(t: Type, v: any) {
    this.dispatch(t).set(t, v);
    return this;
  }

  get(t: Type) {
    return this.dispatch(t).get(t);
  }

  delete(t: Type) {
    return this.dispatch(t).delete(t);
  }

  forEach(cb: (value: V, key: Type, map: Map<Type, V>) => void, thisArg?: any) {
    for (const item of this.entries()) {
      cb.call(thisArg, item[1], item[0], this);
    }

    return this;
  }

  get size() {
    // extremely non-optimal, maybe worth not offering it?
    return [...this.entries()].length;
  }

  clear() {
    this.#realmState.clear();
  }

  *entries() {
    for (const item of this.#realmState) {
      yield item;
    }

    for (const item of this.#parentState) {
      if (!this.#realm.updatesType(item[0])) {
        yield item;
      }
    }
  }

  *values() {
    for (const item of this.entries()) {
      yield item[1];
    }
  }

  *keys() {
    for (const item of this.entries()) {
      yield item[0];
    }
  }

  [Symbol.iterator]() {
    return this.entries();
  }

  [Symbol.toStringTag] = "StateMap";

  dispatch(keyType: Type): Map<Type, V> {
    if (this.#realm.hasType(keyType) || this.#realm.updatesType(keyType)) {
      return this.#realmState;
    }

    return this.#parentState;
  }
}

export class Realm {
  #program!: Program;

  // Type registry

  /**
   * Stores all types owned by this realm.
   */
  #types = new Set<Type>();

  /**
   * Stores types that are cloned into the realm or deleted from the realm. When a realm is active, you will find
   * the updated types instead of the original types in the parent realm.
   */
  #updatedTypes = new Map<Type, Type | null>();

  /**
   * Stores types that are deleted in this realm. When a realm is active and doing a traversal, you will
   * not find this type in e.g. collections. Deleted types are mapped to `null` if you ask for it.
   */
  #deletedTypes = new Set<Type>();

  /**
   * Stores types that are not present in the parent realm.
   */
  #createdTypes = new Set<Type>();

  #stateMaps = new Map<symbol, Map<Type, any>>();
  public key!: symbol;
  public typeFactory: ReturnType<typeof createTypeFactory>;
  public mutators: Mutator<any, any>[];
  #mutantsAwaitingFinish: Map<Type, Type> = new Map();
  #mutationWalker: SemanticNodeListener;

  constructor(program: Program, description: string, mutators: Mutator<any, any>[] = []) {
    this.key = Symbol(description);
    this.#program = program;
    this.mutators = mutators;
    this.#mutationWalker = this.#createMutationWalker();
    Realm.#knownRealms.set(this.key, this);
    this.typeFactory = createTypeFactory(program, this);
  }

  stateMap(stateKey: symbol) {
    let m = this.#stateMaps.get(stateKey);

    if (!m) {
      m = new Map();
      this.#stateMaps.set(stateKey, m);
    }

    return new StateMapRealmView<any>(this, m, this.#program.stateMap(stateKey));
  }

  clone<T extends Type>(type: T): T {
    compilerAssert(type, "Undefined type passed to clone");

    if (this.#updatedTypes.has(type)) {
      // don't re-clone if we've already cloned this type.
      return this.#updatedTypes.get(type)! as T;
    }

    if (this.mutators.length > 0) {
      this.#mutateType(type);
      return this.map(type)!;
    }

    const clone = this.#cloneIntoRealm(type);
    this.typeFactory.finishType(clone);

    return clone;
  }

  remove(type: Type): void {
    this.#updatedTypes.set(type, null);
    this.#deletedTypes.add(type);
  }

  map<T extends Type>(type: T): T | null {
    if (this.#updatedTypes.has(type)) {
      return this.#updatedTypes.get(type)! as any;
    }

    return type;
  }

  hasType(type: Type): boolean {
    return this.#types.has(type);
  }

  updatesType(type: Type): boolean {
    return this.#updatedTypes.has(type);
  }

  #cloneIntoRealm<T extends Type>(type: T): T {
    const clone = this.typeFactory.initializeClone(type);
    this.#updatedTypes.set(type, clone);
    this.#types.add(clone);
    return clone;
  }

  #mutateType(sourceType: Type): void {
    navigateType(sourceType, this.#mutationWalker, {});
  }

  #createMutationWalker(): SemanticNodeListener {
    const invokeMutator = (fn: MutatorRecord<any, any> | undefined, sourceType: Type) => {
      if (!fn) {
        return;
      }

      if (typeof fn === "function") {
        const clone = this.#updatedTypes.has(sourceType)
          ? this.#updatedTypes.get(sourceType)
          : this.#cloneIntoRealm(sourceType);
        this.#mutantsAwaitingFinish.set(sourceType, clone!);
        fn(sourceType, clone, this.#program, this, {});
      } else {
        if (fn.filter(sourceType, this.#program, this, {})) {
          const clone = this.#updatedTypes.has(sourceType)
            ? this.#updatedTypes.get(sourceType)
            : this.#cloneIntoRealm(sourceType);
          this.#mutantsAwaitingFinish.set(sourceType, clone!);
          fn.mutate(sourceType, clone, this.#program, this, {});
        }
      }
    };

    const enterHandler = (key: keyof Mutator<any, any>) => {
      return (type: Type) => {
        for (const mutator of this.mutators) {
          invokeMutator(mutator[key], type);
        }
      };
    };

    const exitHandler = (type: Type) => {
      const mutant = this.#mutantsAwaitingFinish.get(type);
      if (!mutant) return;

      applyDecoratorsToType(this.#program, mutant, this);
    };

    return {
      model: enterHandler("model"),
      exitModel: exitHandler,
      modelProperty: enterHandler("modelProperty"),
      exitModelProperty: exitHandler,
    };
  }

  static #knownRealms = new Map<symbol, Realm>();

  static realmForKey(key: symbol, parentRealm?: Realm) {
    return this.#knownRealms.get(key);
  }
}
