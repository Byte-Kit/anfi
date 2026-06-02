import { describe, it } from "@std/testing/bdd";
import { assertEquals, assertThrows } from "@std/assert";
import { resolvePath } from "./path.ts";

describe("lib/path", () => {
  describe("resolvePath(path)", () => {
    it("should resolve an absolute path without changes", () => {
      assertEquals(resolvePath("/foo/bar"), "/foo/bar");
    });

    it("should resolve a relative path to an absolute path", () => {
      assertEquals(resolvePath("."), Deno.cwd());
    });

    it("should resolve a tilda path to the home directory", () => {
      assertEquals(
        resolvePath("~/documents"),
        `${Deno.env.get("HOME")}/documents`,
      );
    });

    it("should resolve just a tilda to the home directory", () => {
      assertEquals(resolvePath("~"), Deno.env.get("HOME"));
    });

    it("should throw an error when HOME is not set and path starts with ~", () => {
      const originalHome = Deno.env.get("HOME");
      try {
        Deno.env.delete("HOME");
        assertThrows(
          () => resolvePath("~/test"),
          Error,
          "Could not locate the home directory",
        );
      } finally {
        if (originalHome !== undefined) {
          Deno.env.set("HOME", originalHome);
        }
      }
    });
  });
});
