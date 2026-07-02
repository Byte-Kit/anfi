import { assert, assertEquals } from "@std/assert";
import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import { SpyLike, stub } from "@std/testing/mock";
import { createSqliteDbContext } from "./sqlite.ts";

const TEST_DIR = "./output/sqlite-context-test";

describe("createSqliteDbContext", () => {
  describe("in-memory mode (no path)", () => {
    it("executeAsync should run SQL and return affected row count", async () => {
      const ctx = createSqliteDbContext();
      await ctx.executeAsync(
        "CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)",
      );
      const changes = await ctx.executeAsync(
        "INSERT INTO test (name) VALUES (?)",
        ["foo"],
      );
      assertEquals(changes, 1);
      await ctx.closeAsync();
    });

    it("queryAsync should run SQL and return records", async () => {
      const ctx = createSqliteDbContext();
      await ctx.executeAsync(
        "CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)",
      );
      await ctx.executeAsync("INSERT INTO test (name) VALUES (?)", ["foo"]);
      await ctx.executeAsync("INSERT INTO test (name) VALUES (?)", ["bar"]);
      const records = await ctx.queryAsync(
        "SELECT * FROM test ORDER BY id",
      );
      assertEquals(records, [
        { id: 1, name: "foo" },
        { id: 2, name: "bar" },
      ]);
      await ctx.closeAsync();
    });

    it("queryAsync should return empty array for no results", async () => {
      const ctx = createSqliteDbContext();
      await ctx.executeAsync(
        "CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)",
      );
      const records = await ctx.queryAsync("SELECT * FROM test");
      assertEquals(records, []);
      await ctx.closeAsync();
    });

    it("closeAsync should be idempotent", async () => {
      const ctx = createSqliteDbContext();
      await ctx.closeAsync();
      await ctx.closeAsync();
    });

    it("should re-create connection lazily after close", async () => {
      const ctx = createSqliteDbContext();
      await ctx.executeAsync(
        "CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)",
      );
      await ctx.closeAsync();
      await ctx.executeAsync(
        "CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)",
      );
      await ctx.closeAsync();
    });
  });

  describe("file-backed mode (with path)", () => {
    beforeEach(async () => {
      await Deno.mkdir(TEST_DIR, { recursive: true });
    });

    afterEach(async () => {
      await Deno.remove(TEST_DIR, { recursive: true });
    });

    it("should create the database file at the given path", async () => {
      const dbPath = `${TEST_DIR}/test.db`;
      const ctx = createSqliteDbContext({ path: dbPath });
      await ctx.executeAsync(
        "CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)",
      );
      await ctx.executeAsync("INSERT INTO test (name) VALUES (?)", ["foo"]);
      const fileInfo = await Deno.stat(dbPath);
      assert(fileInfo.isFile);
      await ctx.closeAsync();
    });

    it("executeAsync and queryAsync should work with file-backed database", async () => {
      const dbPath = `${TEST_DIR}/test.db`;
      const ctx = createSqliteDbContext({ path: dbPath });
      await ctx.executeAsync(
        "CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)",
      );
      await ctx.executeAsync("INSERT INTO test (name) VALUES (?)", ["foo"]);
      const records = await ctx.queryAsync("SELECT * FROM test");
      assertEquals(records, [{ id: 1, name: "foo" }]);
      await ctx.closeAsync();
    });

    it("should create subdirectories when the path has nested directories", async () => {
      const dbPath = `${TEST_DIR}/nested/subdir/test.db`;
      const ctx = createSqliteDbContext({ path: dbPath });
      await ctx.executeAsync(
        "CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)",
      );
      const fileInfo = await Deno.stat(dbPath);
      assert(fileInfo.isFile);
      await ctx.closeAsync();
    });
  });

  describe("debug option", () => {
    let debugSpy: SpyLike;

    beforeEach(() => {
      debugSpy = stub(console, "debug");
    });

    afterEach(() => {
      debugSpy.restore();
    });

    it("should log to console.debug when debug is true on executeAsync", async () => {
      const ctx = createSqliteDbContext({ debug: true });
      await ctx.executeAsync(
        "CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)",
      );
      assertEquals(debugSpy.calls.length, 1);
      assertEquals(debugSpy.calls[0].args[0], "[DB] execute:");
      await ctx.closeAsync();
    });

    it("should log for queryAsync when debug is true", async () => {
      const ctx = createSqliteDbContext({ debug: true });
      await ctx.executeAsync(
        "CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)",
      );
      assertEquals(debugSpy.calls.length, 1);
      await ctx.queryAsync("SELECT * FROM test");
      assertEquals(debugSpy.calls.length, 2);
      await ctx.closeAsync();
    });

    it("should not log when debug is false", async () => {
      const ctx = createSqliteDbContext({ debug: false });
      await ctx.executeAsync(
        "CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)",
      );
      assertEquals(debugSpy.calls.length, 0);
      await ctx.closeAsync();
    });

    it("should not log when debug is not set", async () => {
      const ctx = createSqliteDbContext();
      await ctx.executeAsync(
        "CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)",
      );
      assertEquals(debugSpy.calls.length, 0);
      await ctx.closeAsync();
    });
  });
});
