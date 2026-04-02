import { assert, assertFalse } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import * as lib from "./assert.ts";

describe("assert", () => {
  it("assert.string(value) should return a new StringAssertion", () => {
    assert(lib.assert.string("") instanceof lib.StringAssertion);
  });

  it("assert.boolean(value) should return a new BooleanAssertion", () => {
    assert(lib.assert.boolean(true) instanceof lib.BooleanAssertion);
  });

  describe("StringAssertion", () => {
    it("equals(expected) should check if actual value equals expected value", () => {
      assert(lib.assert.string("Hello").equals("Hello"));
      assertFalse(lib.assert.string("Hello").equals("Hello World"));
    });

    it("notBlank() should check if string value is not blank", () => {
      assert(lib.assert.string("Hello").notBlank());
      assertFalse(lib.assert.string("").notBlank());
    });
  });

  describe("BooleanAssertion", () => {
    it("equals(expected) should check if actual value equals expected value", () => {
      assert(lib.assert.boolean(true).equals(true));
      assert(lib.assert.boolean(false).equals(false));
      assertFalse(lib.assert.boolean("Hello").equals(true));
    });
  });
});
