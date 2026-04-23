export class NonExistentDictionaryEntryException extends Error {
  constructor(cause?: string) {
    super("NonExistentDictionaryEntry", { cause });
  }
}

export class Dict<K, V> {
  private keyToValue: Map<K, V> = new Map();
  private valueToKey: Map<V, K> = new Map();

  constructor(entries: [K, V][]) {
    entries.forEach((entry) => {
      this.keyToValue.set(entry[0], entry[1]);
      this.valueToKey.set(entry[1], entry[0]);
    });
  }

  getValue(key: K): V {
    const result = this.keyToValue.get(key);
    if (result === undefined) {
      throw new NonExistentDictionaryEntryException(
        "Attempted lookup using a non-existent key",
      );
    }

    return result;
  }

  hasKey(key: K) {
    return this.keyToValue.has(key);
  }

  getKey(value: V): K {
    const result = this.valueToKey.get(value);
    if (result === undefined) {
      throw new NonExistentDictionaryEntryException(
        "Attempted lookup using a non existent value",
      );
    }

    return result;
  }

  entries() {
    return this.keyToValue.entries().toArray();
  }

  keys() {
    return this.keyToValue.keys().toArray();
  }

  values() {
    return this.keyToValue.values().toArray();
  }

  set(key: K, value: V) {
    this.keyToValue.set(key, value);
    this.valueToKey.set(value, key);
  }

  filterByKey(predicate: (key: K) => boolean) {
    const filteredKeyToValues = this.keyToValue
      .entries()
      .filter((entry) => {
        const [key, _] = entry;
        return predicate(key);
      })
      .toArray();
    return new Dict<K, V>(filteredKeyToValues);
  }

  filterByValue(predicate: (value: V) => boolean) {
    const filteredKeyToValues = this.keyToValue
      .entries()
      .filter((entry) => {
        const [_, value] = entry;
        return predicate(value);
      })
      .toArray();
    return new Dict<K, V>(filteredKeyToValues);
  }

  map<KMap, VMap>(
    keyMapper: (key: K) => KMap,
    valueMapper: (value: V) => VMap,
  ) {
    const entries: [KMap, VMap][] = this.keyToValue
      .entries()
      .map<[KMap, VMap]>((entry) => {
        const [key, value] = entry;
        return [keyMapper(key), valueMapper(value)];
      })
      .toArray();
    return new Dict(entries);
  }

  mapValue<VMap>(valueMapper: (value: V) => VMap) {
    return this.map((k) => k, valueMapper);
  }

  reduce<T>(reducer: (result: T, entry: [K, V]) => T, defaultResult: T) {
    return this.entries().reduce(reducer, defaultResult);
  }

  merge(
    dict: Dict<K, V>,
    strategy: "preserve" | "overwrite" = "preserve",
  ) {
    dict.keys().forEach((key) => {
      if (!this.hasKey(key) || strategy === "overwrite") {
        this.set(key, dict.getValue(key));
      }
    });
  }
}
