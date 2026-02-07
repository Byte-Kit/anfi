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

  getKey(value: V): K {
    const result = this.valueToKey.get(value);
    if (result === undefined) {
      throw new NonExistentDictionaryEntryException(
        "Attempted lookup using a non existent value",
      );
    }

    return result;
  }
}
