export function ifNaNThen(value: number, fallback: number) {
  return isNaN(value) ? fallback : value;
}

export interface IEqual<T> {
  equal(other: T): boolean;
}
