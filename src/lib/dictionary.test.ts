import { describe, it } from "@std/testing/bdd";
import { Dict, NonExistentDictionaryEntryException } from "./dictionary.ts";
import { assertEquals } from "@std/assert/equals";
import { assertIsError, assertThrows } from "@std/assert";

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
});
