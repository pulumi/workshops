export function assertExists<T>(el: T | null | undefined, message?: string): T {
  if (el === null || el === undefined) {
    throw new Error(message ?? `Expected a value but got ${el}`);
  }
  return el;
}
