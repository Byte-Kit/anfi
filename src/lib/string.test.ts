import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { camelToSnakeCase, StringBuilder, trim } from "./string.ts";

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

  describe("line(value)", () => {
    describe("when invoked with one or more arguments", () => {
      it("treat the argument as a paragraph and append to output", () => {
        assertEquals(
          new StringBuilder().line("Hello,").line("My name is Isaac")
            .get(),
          "Hello,\nMy name is Isaac\n",
        );
      });
    });
  });

  describe("lines(values, sep)", () => {
    it("should treat each argument as a paragraph and append to output", () => {
      assertEquals(
        new StringBuilder()
          .lines(["Hello,", "My name is Isaac"], "")
          .get(),
        "Hello,\nMy name is Isaac\n",
      );
    });
  });
});

describe("trim(strings, ...values)", () => {
  describe("single-line template", () => {
    it("returns the template as-is with no values", () => {
      assertEquals(trim`SELECT * FROM users`, "SELECT * FROM users");
    });

    it("interpolates a single value", () => {
      assertEquals(
        trim`SELECT * FROM users WHERE id = ${1}`,
        "SELECT * FROM users WHERE id = 1",
      );
    });

    it("interpolates multiple values", () => {
      assertEquals(
        trim`SELECT * FROM users WHERE name = ${"Alice"} AND age = ${30}`,
        "SELECT * FROM users WHERE name = Alice AND age = 30",
      );
    });
  });

  describe("multi-line template with indentation", () => {
    it("dedents by the indent of the first non-empty line", () => {
      const query = trim`
        SELECT *
        FROM users
        WHERE id = ${1}
      `;
      assertEquals(query, "SELECT *\nFROM users\nWHERE id = 1");
    });

    it("handles deeper indentation on later lines", () => {
      const query = trim`
        SELECT *
          FROM users
        WHERE id = ${1}
      `;
      assertEquals(query, "SELECT *\n  FROM users\nWHERE id = 1");
    });

    it("handles empty lines within the template", () => {
      const query = trim`
        SELECT *

        FROM users
      `;
      assertEquals(query, "SELECT *\n\nFROM users");
    });

    it("preserves lines with less indent than the first non-empty line", () => {
      const query = trim`
        SELECT *
FROM products;
      `;
      assertEquals(query, "SELECT *\nFROM products;");
    });

    it("handles template with no interpolation", () => {
      const query = trim`
        SELECT *
        FROM users
      `;
      assertEquals(query, "SELECT *\nFROM users");
    });
  });
});

describe("camelToSnakeCase(string)", () => {
  it("should convert camelCase to snake_case", () => {
    assertEquals(camelToSnakeCase("camelCase"), "camel_case");
    assertEquals(camelToSnakeCase("keyNumber1"), "key_number1");
  });
});
