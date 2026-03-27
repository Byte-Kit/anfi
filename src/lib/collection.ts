export function collect<T>(items: T[]) {
  return Collection.from(items);
}

export class Collection<T> {
  private _array: T[] = [];

  constructor(array: T[]) {
    this._array = array;
  }

  static from<T>(array: T[]) {
    return new Collection<T>(array);
  }

  toArray() {
    return this._array;
  }

  isEmpty() {
    return this._array.length < 1;
  }

  groupBy(keySelector: (item: T) => unknown = (x) => x) {
    return Collection.from(this.toDict(keySelector).values().toArray());
  }

  unique(keySelector: (item: T) => unknown = (x) => x) {
    return Collection.from(this.toDict(keySelector).keys().toArray());
  }

  first(): T {
    return this.toArray()[0];
  }

  withoutFirst(count: number = 1) {
    return Collection.from(this.toArray().slice(count));
  }

  withoutLast() {
    return Collection.from(this.toArray().slice(0, -1));
  }

  join(sep?: string) {
    return this.toArray().join(sep);
  }

  private toDict(keySelector: (item: T) => unknown): Map<unknown, T[]> {
    return this._array.reduce((dict, item) => {
      const key = keySelector(item);
      const group = dict.get(key);

      if (group) {
        dict.set(key, group.concat(item));
      } else {
        dict.set(key, [item]);
      }

      return dict;
    }, new Map<unknown, T[]>());
  }
}
