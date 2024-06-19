export class NotImplementedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotImplementedError";
  }
}

export class UnreachableCodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnreachableCodeError";
  }
}
