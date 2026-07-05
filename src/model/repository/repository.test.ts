import { DbRecord, DbValue } from "@anfi/db/common.ts";
import { DbContext } from "@anfi/db/context/index.ts";
import { createRepository, Entity } from "./repository.ts";
import { assert, assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

const testEntities: Entity[] = [
  { id: "a1", name: "Alice", age: 30 },
  { id: "b2", name: "Bob", age: 25 },
];

function createMockDbContext(): {
  context: DbContext;
  executeAsyncCalls: { sql: string; args?: DbValue[] }[];
  queryAsyncCalls: { sql: string; args?: DbValue[] }[];
  queryAsyncResult: DbRecord[];
  executeAsyncResult: number;
} {
  const executeAsyncCalls: { sql: string; args?: DbValue[] }[] = [];
  const queryAsyncCalls: { sql: string; args?: DbValue[] }[] = [];
  let queryAsyncResult: DbRecord[] = [];
  let executeAsyncResult = 1;

  const context: DbContext = {
    executeAsync: async (sql: string, args?: DbValue[]) => {
      executeAsyncCalls.push({ sql, args });
      return await Promise.resolve(executeAsyncResult);
    },
    queryAsync: async (sql: string, args?: DbValue[]) => {
      queryAsyncCalls.push({ sql, args });
      return await Promise.resolve(queryAsyncResult);
    },
    transactionAsync: async <T>(
      action: (ctx: DbContext) => Promise<T>,
    ): Promise<T> => {
      return await action(context);
    },
    closeAsync: async () => {},
    cleanAsync: async () => {},
  };

  return {
    context,
    executeAsyncCalls,
    queryAsyncCalls,
    get queryAsyncResult() {
      return queryAsyncResult;
    },
    set queryAsyncResult(val: DbRecord[]) {
      queryAsyncResult = val;
    },
    get executeAsyncResult() {
      return executeAsyncResult;
    },
    set executeAsyncResult(val: number) {
      executeAsyncResult = val;
    },
  };
}

function normalizeSql(sql: string): string {
  return sql.replace(/\s+/g, " ").trim();
}

const testAttributes = {
  id: { column: "id" },
  name: { column: "name" },
  age: { column: "age" },
};

describe("createRepository", () => {
  describe("saveAsync", () => {
    it("should return 0 without calling dbContext when no entities are provided", async () => {
      const mock = createMockDbContext();
      const repo = createRepository({
        dbContext: mock.context,
        table: "items",
        attributes: testAttributes,
      });

      const result = await repo.saveAsync();

      assertEquals(result, 0);
      assertEquals(mock.executeAsyncCalls.length, 0);
    });

    it("should build INSERT … ON CONFLICT SQL for a single entity", async () => {
      const mock = createMockDbContext();
      const repo = createRepository({
        dbContext: mock.context,
        table: "items",
        attributes: testAttributes,
      });

      await repo.saveAsync(testEntities[0]);

      assertEquals(mock.executeAsyncCalls.length, 1);
      const sql = normalizeSql(mock.executeAsyncCalls[0].sql);
      assert(sql.includes("INSERT INTO [items]"), `SQL: ${sql}`);
      assert(sql.includes("ON CONFLICT(id) DO UPDATE SET"), `SQL: ${sql}`);
      assert(sql.includes("(id,name,age)"), `SQL: ${sql}`);
      assert(sql.includes("(?,?,?)"), `SQL: ${sql}`);
      assert(sql.includes("id = excluded.id"), `SQL: ${sql}`);
      assert(sql.includes("name = excluded.name"), `SQL: ${sql}`);
      assert(sql.includes("age = excluded.age"), `SQL: ${sql}`);
    });

    it("should build multi-row INSERT for multiple entities", async () => {
      const mock = createMockDbContext();
      const repo = createRepository({
        dbContext: mock.context,
        table: "items",
        attributes: testAttributes,
      });

      await repo.saveAsync(...testEntities);

      assertEquals(mock.executeAsyncCalls.length, 1);
      const sql = mock.executeAsyncCalls[0].sql;
      const valueCount = (sql.match(/\(\?,\s*\?,\s*\?\)/g) || []).length;
      assertEquals(valueCount, 2);
    });

    it("should return the number of affected rows from executeAsync", async () => {
      const mock = createMockDbContext();
      mock.executeAsyncResult = 3;
      const repo = createRepository({
        dbContext: mock.context,
        table: "items",
        attributes: testAttributes,
      });

      const result = await repo.saveAsync(...testEntities);

      assertEquals(result, 3);
    });
  });

  describe("getAllAsync", () => {
    it("should query all records from the table", async () => {
      const mock = createMockDbContext();
      const repo = createRepository({
        dbContext: mock.context,
        table: "items",
        attributes: testAttributes,
      });

      await repo.getAllAsync();

      assertEquals(mock.queryAsyncCalls.length, 1);
      const call = mock.queryAsyncCalls[0];
      assertEquals(normalizeSql(call.sql), "SELECT * FROM [items]");
      assertEquals(call.args, undefined);
    });

    it("should map returned DbRecords to entities", async () => {
      const mock = createMockDbContext();
      mock.queryAsyncResult = [
        { id: "x1", name: "Xander", age: 40 },
        { id: "y2", name: "Yara", age: 35 },
      ];
      const repo = createRepository({
        dbContext: mock.context,
        table: "items",
        attributes: testAttributes,
      });

      const result = await repo.getAllAsync();

      assertEquals(result.length, 2);
      assertEquals(result[0], { id: "x1", name: "Xander", age: 40 });
      assertEquals(result[1], { id: "y2", name: "Yara", age: 35 });
    });

    it("should return empty array when no records exist", async () => {
      const mock = createMockDbContext();
      mock.queryAsyncResult = [];
      const repo = createRepository({
        dbContext: mock.context,
        table: "items",
        attributes: testAttributes,
      });

      const result = await repo.getAllAsync();

      assertEquals(result, []);
    });
  });

  describe("getByIdsAsync", () => {
    it("should return empty array without calling dbContext when ids is empty", async () => {
      const mock = createMockDbContext();
      const repo = createRepository({
        dbContext: mock.context,
        table: "items",
        attributes: testAttributes,
      });

      const result = await repo.getByIdsAsync([]);

      assertEquals(result, []);
      assertEquals(mock.queryAsyncCalls.length, 0);
    });

    it("should build SELECT … WHERE id IN (?) for a single id", async () => {
      const mock = createMockDbContext();
      const repo = createRepository({
        dbContext: mock.context,
        table: "items",
        attributes: testAttributes,
      });

      await repo.getByIdsAsync(["a1"]);

      assertEquals(mock.queryAsyncCalls.length, 1);
      const call = mock.queryAsyncCalls[0];
      assert(call.sql.includes("SELECT *"));
      assert(call.sql.includes("FROM [items]"));
      assert(call.sql.includes("WHERE id IN (?)"));
      assertEquals(call.args, ["a1"]);
    });

    it("should build WHERE id IN (?, ?, …) for multiple ids", async () => {
      const mock = createMockDbContext();
      const repo = createRepository({
        dbContext: mock.context,
        table: "items",
        attributes: testAttributes,
      });

      await repo.getByIdsAsync(["a1", "b2", "c3"]);

      assertEquals(mock.queryAsyncCalls.length, 1);
      const call = mock.queryAsyncCalls[0];
      assert(call.sql.includes("WHERE id IN (?, ?, ?)"));
      assertEquals(call.args, ["a1", "b2", "c3"]);
    });

    it("should map returned records to entities", async () => {
      const mock = createMockDbContext();
      mock.queryAsyncResult = [
        { id: "a1", name: "Alice", age: 30 },
      ];
      const repo = createRepository({
        dbContext: mock.context,
        table: "items",
        attributes: testAttributes,
      });

      const result = await repo.getByIdsAsync(["a1"]);

      assertEquals(result.length, 1);
      assertEquals(result[0], { id: "a1", name: "Alice", age: 30 });
    });
  });

  describe("deleteByIdsAsync", () => {
    it("should return 0 without calling dbContext when ids is empty", async () => {
      const mock = createMockDbContext();
      const repo = createRepository({
        dbContext: mock.context,
        table: "items",
        attributes: testAttributes,
      });

      const result = await repo.deleteByIdsAsync([]);

      assertEquals(result, 0);
      assertEquals(mock.executeAsyncCalls.length, 0);
    });

    it("should build DELETE SQL for a single id", async () => {
      const mock = createMockDbContext();
      const repo = createRepository({
        dbContext: mock.context,
        table: "items",
        attributes: testAttributes,
      });

      await repo.deleteByIdsAsync(["a1"]);

      assertEquals(mock.executeAsyncCalls.length, 1);
      const call = mock.executeAsyncCalls[0];
      assert(call.sql.includes("DELETE FROM items"));
      assert(call.sql.includes("WHERE id IN (?)"));
      assertEquals(call.args, ["a1"]);
    });

    it("should build DELETE SQL for multiple ids", async () => {
      const mock = createMockDbContext();
      const repo = createRepository({
        dbContext: mock.context,
        table: "items",
        attributes: testAttributes,
      });

      await repo.deleteByIdsAsync(["a1", "b2", "c3"]);

      assertEquals(mock.executeAsyncCalls.length, 1);
      const call = mock.executeAsyncCalls[0];
      assert(call.sql.includes("WHERE id IN (?, ?, ?)"));
      assertEquals(call.args, ["a1", "b2", "c3"]);
    });

    it("should return the number of deleted rows", async () => {
      const mock = createMockDbContext();
      mock.executeAsyncResult = 2;
      const repo = createRepository({
        dbContext: mock.context,
        table: "items",
        attributes: testAttributes,
      });

      const result = await repo.deleteByIdsAsync(["a1", "b2"]);

      assertEquals(result, 2);
    });
  });
});
