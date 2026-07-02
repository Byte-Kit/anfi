import { DbContext } from "@anfi/db/context/index.ts";
import { DbRecord, DbValue } from "@anfi/db/common.ts";
import { SpyLike, stub } from "@std/testing/mock";
import {
  createMigrationRunner,
  MigrationOpts,
  MigrationRunner,
} from "@anfi/db/migration.ts";
import { assertEquals } from "@std/assert";
import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";

const TEST_DIR = "./output/migration-test";
const MIGRATION_DIRS = ["002-second", "001-first", "003-third"];

async function writeMigration(
  name: string,
  upSql: string,
  downSql: string,
): Promise<void> {
  const dir = `${TEST_DIR}/${name}`;
  await Deno.mkdir(dir, { recursive: true });
  await Deno.writeTextFile(`${dir}/up.sql`, upSql);
  await Deno.writeTextFile(`${dir}/down.sql`, downSql);
}

function createMockDbContext(): {
  context: DbContext;
  executeAsyncCalls: { sql: string; args?: DbValue[] }[];
} {
  const executeAsyncCalls: { sql: string; args?: DbValue[] }[] = [];

  const context: DbContext = {
    executeAsync: async (sql: string, args?: DbValue[]) => {
      executeAsyncCalls.push({ sql, args });
      return await Promise.resolve(1);
    },
    queryAsync: async (_sql: string, _args?: DbValue[]) =>
      await Promise.resolve([] as DbRecord[]),
    transactionAsync: async <T>(action: (ctx: DbContext) => Promise<T>) =>
      await action(context),
    closeAsync: async () => {},
    cleanAsync: async () => {},
  };

  return { context, executeAsyncCalls };
}

describe("createMigrationRunner", () => {
  let runner: MigrationRunner;
  let mock: ReturnType<typeof createMockDbContext>;

  beforeEach(async () => {
    await Deno.mkdir(TEST_DIR, { recursive: true });
    mock = createMockDbContext();
    runner = createMigrationRunner(mock.context);
  });

  afterEach(async () => {
    await Deno.remove(TEST_DIR, { recursive: true });
  });

  describe("migrateAsync(opts)", () => {
    describe("when migration directories exist with valid scripts", () => {
      beforeEach(async () => {
        for (const name of MIGRATION_DIRS) {
          await writeMigration(name, `CREATE TABLE ${name} (id);`, "DROP;");
        }
      });

      it("should execute migrations in sorted order", async () => {
        await runner.migrateAsync(
          {
            pathToMigrations: TEST_DIR,
          } satisfies MigrationOpts,
        );

        const executed = mock.executeAsyncCalls.map((c) => c.sql);
        assertEquals(executed.length, 3);
        assertEquals(executed[0], "CREATE TABLE 001-first (id)");
        assertEquals(executed[1], "CREATE TABLE 002-second (id)");
        assertEquals(executed[2], "CREATE TABLE 003-third (id)");
      });
    });

    describe("when a migration directory is missing down.sql", () => {
      beforeEach(async () => {
        await writeMigration("valid", "VALID;", "VALID;");
        const dir = `${TEST_DIR}/invalid`;
        await Deno.mkdir(dir, { recursive: true });
        await Deno.writeTextFile(`${dir}/up.sql`, "INVALID;");
      });

      it("should skip the incomplete migration", async () => {
        await runner.migrateAsync(
          {
            pathToMigrations: TEST_DIR,
          } satisfies MigrationOpts,
        );

        const executed = mock.executeAsyncCalls.map((c) => c.sql);
        assertEquals(executed, ["VALID"]);
      });
    });

    describe("when a migration directory is missing up.sql", () => {
      beforeEach(async () => {
        await writeMigration("valid", "VALID;", "VALID;");
        const dir = `${TEST_DIR}/invalid`;
        await Deno.mkdir(dir, { recursive: true });
        await Deno.writeTextFile(`${dir}/down.sql`, "INVALID;");
      });

      it("should skip the incomplete migration", async () => {
        await runner.migrateAsync(
          {
            pathToMigrations: TEST_DIR,
          } satisfies MigrationOpts,
        );

        const executed = mock.executeAsyncCalls.map((c) => c.sql);
        assertEquals(executed, ["VALID"]);
      });
    });

    describe("when a non-directory entry exists", () => {
      beforeEach(async () => {
        await writeMigration("001-mig", "CREATE TABLE test (id);", "DROP;");
        await Deno.writeTextFile(`${TEST_DIR}/file.txt`, "not a dir");
      });

      it("should ignore non-directory entries", async () => {
        await runner.migrateAsync(
          {
            pathToMigrations: TEST_DIR,
          } satisfies MigrationOpts,
        );

        const executed = mock.executeAsyncCalls.map((c) => c.sql);
        assertEquals(executed, ["CREATE TABLE test (id)"]);
      });
    });

    describe("when migration SQL has multiple statements", () => {
      beforeEach(async () => {
        await writeMigration(
          "001-multi",
          "CREATE TABLE t (a); INSERT INTO t VALUES (1); COMMIT;",
          "DROP TABLE t;",
        );
      });

      it("should execute each statement individually", async () => {
        await runner.migrateAsync(
          {
            pathToMigrations: TEST_DIR,
          } satisfies MigrationOpts,
        );

        const executed = mock.executeAsyncCalls.map((c) => c.sql);
        assertEquals(executed, [
          "CREATE TABLE t (a)",
          "INSERT INTO t VALUES (1)",
          "COMMIT",
        ]);
      });
    });

    describe("when debug is enabled", () => {
      let debugSpy: SpyLike;

      beforeEach(async () => {
        await writeMigration("001-test", "SELECT 1;", "SELECT 2;");
        debugSpy = stub(console, "debug");
      });

      afterEach(() => {
        debugSpy.restore();
      });

      it("should log migration progress", async () => {
        await runner.migrateAsync(
          {
            pathToMigrations: TEST_DIR,
            debug: true,
          } satisfies MigrationOpts,
        );

        assertEquals(debugSpy.calls.length, 3);
      });

      it("should not log when debug is not set", async () => {
        await runner.migrateAsync(
          {
            pathToMigrations: TEST_DIR,
          } satisfies MigrationOpts,
        );

        assertEquals(debugSpy.calls.length, 0);
      });
    });

    describe("when no migration subdirectories exist", () => {
      it("should complete without executing any statements", async () => {
        await runner.migrateAsync(
          {
            pathToMigrations: TEST_DIR,
          } satisfies MigrationOpts,
        );

        assertEquals(mock.executeAsyncCalls.length, 0);
      });
    });

    describe("when pathToMigrations is specified", () => {
      it("should resolve the path and execute migrations", async () => {
        await Deno.mkdir(`${TEST_DIR}/001-test`, { recursive: true });
        await Deno.writeTextFile(`${TEST_DIR}/001-test/up.sql`, "SELECT 1;");
        await Deno.writeTextFile(`${TEST_DIR}/001-test/down.sql`, "SELECT 2;");

        await runner.migrateAsync(
          {
            pathToMigrations: TEST_DIR,
          } satisfies MigrationOpts,
        );

        assertEquals(mock.executeAsyncCalls.length, 1);
        assertEquals(mock.executeAsyncCalls[0].sql, "SELECT 1");
      });
    });

    describe("when run with multiple migrations containing multi-statement SQL", () => {
      beforeEach(async () => {
        await writeMigration(
          "001-schema",
          [
            "BEGIN TRANSACTION",
            'CREATE TABLE "account" ("id" TEXT NOT NULL, PRIMARY KEY("id"))',
            "COMMIT",
          ].join(";\n"),
          'DROP TABLE "account";',
        );
        await writeMigration(
          "002-data",
          [
            "BEGIN TRANSACTION",
            "INSERT INTO account VALUES ('a1')",
            "INSERT INTO account VALUES ('a2')",
            "COMMIT",
          ].join(";\n"),
          'DELETE FROM "account";',
        );
      });

      it("should execute all statements across migrations in order", async () => {
        await runner.migrateAsync(
          {
            pathToMigrations: TEST_DIR,
          } satisfies MigrationOpts,
        );

        const executed = mock.executeAsyncCalls.map((c) => c.sql);
        assertEquals(executed.length, 7);
        assertEquals(executed[0], "BEGIN TRANSACTION");
        assertEquals(
          executed[1],
          'CREATE TABLE "account" ("id" TEXT NOT NULL, PRIMARY KEY("id"))',
        );
        assertEquals(executed[2], "COMMIT");
        assertEquals(executed[3], "BEGIN TRANSACTION");
        assertEquals(executed[4], "INSERT INTO account VALUES ('a1')");
        assertEquals(executed[5], "INSERT INTO account VALUES ('a2')");
        assertEquals(executed[6], "COMMIT");
      });
    });
  });
});
