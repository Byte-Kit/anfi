import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { camelToSnakeCase, StringBuilder } from "./string.ts";

describe("StringBuilder", () => {
  describe("append", () => {
    it("should append the given values to the string", () => {
      assertEquals(
        new StringBuilder().append("Hello World", "!").get(),
        "Hello World!",
      );
    });
  });

  describe("word", () => {
    describe("when invoked with no arguments", () => {
      it("should does nothing", () => {
        assertEquals(new StringBuilder().word().get(), "");
      });
    });

    describe("when invoked using a single string", () => {
      it("should append the string with an extra whitespace at the end", () => {
        assertEquals(
          new StringBuilder().word("Hello").get(),
          "Hello ",
        );
      });
    });

    describe("when invoked using multiple strings", () => {
      it("should append strings as a sentence with an extra whitespace at the end", () => {
        assertEquals(
          new StringBuilder().word("Hello", "World").get(),
          "Hello World ",
        );
      });
    });
  });

  describe("line", () => {
    describe("when invoked with no arguments", () => {
      it("should does nothing", () => {
        assertEquals(new StringBuilder().line().get(), "");
      });
    });

    describe("when invoked with one or more arguments", () => {
      it("treat each argument as a paragraph and append to output", () => {
        assertEquals(
          new StringBuilder().line("Hello,", "My name is Isaac")
            .get(),
          "Hello,\nMy name is Isaac\n",
        );
      });
    });
  });
});

describe("camelToSnakeCase(string)", () => {
  it("should convert camelCase to snake_case", () => {
    assertEquals(camelToSnakeCase("camelCase"), "camel_case");
    assertEquals(camelToSnakeCase("keyNumber1"), "key_number1");
  });
});
