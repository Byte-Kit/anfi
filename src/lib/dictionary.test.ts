import {
  assert,
  assertArrayIncludes,
  assertEquals,
  assertFalse,
  assertIsError,
  assertThrows,
} from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { Dict, NonExistentDictionaryEntryException } from "./dictionary.ts";

describe("Dict<K, V>", () => {
  const dict = new Dict<string, string>([["key", "value"]]);

  describe("getValue()", () => {
    it("should return a value based on a key", () => {
      assertEquals(dict.getValue("key"), "value");
    });

    it("should throw if a value cannot be found", () => {
      const ex = assertThrows(() => dict.getValue("invalid-key"));
      assertIsError(ex, NonExistentDictionaryEntryException);
    });
  });

  describe("getKey()", () => {
    it("should return a key based on a value", () => {
      assertEquals(dict.getKey("value"), "key");
    });

    it("should throw if a key cannot be found", () => {
      const ex = assertThrows(() => dict.getKey("invalid-value"));
      assertIsError(ex, NonExistentDictionaryEntryException);
    });
  });

  describe("haskey(key)", () => {
    it("should return a boolean indicating whether the key exists in the dictionary", () => {
      assert(dict.hasKey("key"));
      assertFalse(dict.hasKey("key1"));
    });
  });

  describe("entries()", () => {
    it("should return an array of key-value tuples", () => {
      assertArrayIncludes(dict.entries(), [["key", "value"]]);
    });
  });

  describe("keys()", () => {
    it("should return an array containing the keys", () => {
      assertArrayIncludes(dict.keys(), ["key"]);
    });
  });

  describe("values()", () => {
    it("should return an array containing the values", () => {
      assertArrayIncludes(dict.values(), ["value"]);
    });
  });

  describe("set(key, value)", () => {
    it("should set a new key and value", () => {
      const dict = new Dict([]);
      dict.set("name", "Isaac");
      assertEquals(dict.getValue("name"), "Isaac");
    });
  });

  describe("filterByKey(predicate)", () => {
    it(
      "should filter the dictionary entries by applying a predicate to keys",
      () => {
        const dict = new Dict([]);
        dict.set("name", "Isaac");
        dict.set("age", 17);
        const actual = dict.filterByKey((k) => k === "name");
        assert(actual.hasKey("name"));
        assertFalse(actual.hasKey("age"));
      },
    );
  });

  describe("filterByValue(predicate)", () => {
    it(
      "should filter the dictionary entries by applying a predicate to values",
      () => {
        const dict = new Dict([]);
        dict.set("name", "Isaac");
        dict.set("age", 17);
        const actual = dict.filterByValue((v) => v === "Isaac");
        assert(actual.hasKey("name"));
        assertFalse(actual.hasKey("age"));
      },
    );
  });

  describe("map(keyMapper, valueMapper)", () => {
    it("should map keys and values of a dictionary", () => {
      const actual = dict.map(
        (k) => k.concat("-mapped"),
        (v) => v.concat("-mapped"),
      );
      assertArrayIncludes(actual.entries(), [["key-mapped", "value-mapped"]]);
    });
  });

  describe("mapValue(valueMapper)", () => {
    it("should map values of a dictionary", () => {
      const actual = dict.mapValue(
        (v) => v.concat("-mapped"),
      );
      assertArrayIncludes(actual.entries(), [["key", "value-mapped"]]);
    });
  });

  describe("reduce(reducer, defaultValue)", () => {
    it("should run a reducer on each entry", () => {
      const dict = new Dict([[1, 1], [2, 2]]);
      const actual = dict.reduce(
        (valueSum, [_, value]) => valueSum + value,
        0,
      );
      assertEquals(actual, 3);
    });
  });

  describe("merge(dict, strategy)", () => {
    describe("when using preserve strategy", () => {
      it("should merge two dicts, preserving existing keys", () => {
        const dictA = new Dict([[1, 1], [2, 2]]);
        const dictB = new Dict([[1, 4], [2, 5]]);
        const mergedDict = dictA.merge(dictB, "preserve").entries();
        assertArrayIncludes(mergedDict, [[1, 1], [2, 2]]);
      });
    });

    describe("when using overwrite strategy", () => {
      it("should merge two dicts, overwriting existing keys", () => {
        const dictA = new Dict([[1, 1], [2, 2]]);
        const dictB = new Dict([[1, 4], [2, 5]]);
        const mergedDict = dictA.merge(dictB, "overwrite").entries();
        assertArrayIncludes(mergedDict, [[1, 4], [2, 5]]);
      });
    });
  });
});
