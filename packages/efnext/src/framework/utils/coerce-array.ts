export function coerceArray(v: unknown): any {
  if (v === null || v === undefined || Array.isArray(v)) {
    return v;
  }

  return [v];
}
