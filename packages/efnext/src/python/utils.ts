import { ComponentChild, ComponentChildren } from "#jsx/jsx-runtime";

export function* withSep<T>(
  iterator: Iterable<T>,
  joiner = ", "
): Generator<[T, string | undefined]> {
  const iter = iterator[Symbol.iterator]();
  let current = iter.next();
  let next = iter.next();

  while (!current.done) {
    yield [current.value, next.done ? undefined : joiner];
    current = next;
    next = iter.next();
  }
}

export function mapWithSep<T>(
  iterator: Iterable<T>,
  mapFn: (value: T) => ComponentChild,
  joiner = ", "
): ComponentChildren {
  const children: ComponentChildren = [];

  const separated = withSep(iterator, joiner);
  for (const [value, separator] of separated) {
    children.push(mapFn(value));
    if (separator) {
      children.push(separator);
    }
  }

  return children;
}
