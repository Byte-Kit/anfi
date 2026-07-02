import { DbContext } from "@anfi/db/context/index.ts";
import { DbRecord, DbValue } from "@anfi/db/common.ts";
import * as fs from "@anfi/lib/fs.ts";
import * as path from "@anfi/lib/path.ts";
import * as sqlite from "node:sqlite";

export type SqliteDbConnection = sqlite.DatabaseSync;
export type SqliteDbContextOptions = {
  path?: string;
  pathToMigrations?: string;
  debug?: boolean;
};

export function createSqliteDbContext(
  opts?: SqliteDbContextOptions,
): DbContext {
  const dbPath = opts?.path ? path.resolvePath(opts.path) : null;

  let dbConnection: SqliteDbConnection | null = null;
  let inTransaction = false;

  const getDbConnectionAsync = async (): Promise<SqliteDbConnection> => {
    if (dbConnection) return dbConnection;

    if (dbPath == null) {
      dbConnection = new sqlite.DatabaseSync(":memory:");
    } else {
      await Deno.mkdir(path.dirname(dbPath), { recursive: true });
      dbConnection = new sqlite.DatabaseSync(dbPath);
    }

    return dbConnection;
  };

  const dbContext: DbContext = {
    executeAsync: async (
      sql: string,
      args: DbValue[] = [],
    ): Promise<number> => {
      if (opts?.debug) console.debug("[DB] execute:", sql, ...args);
      const conn = await getDbConnectionAsync();
      const result = conn.prepare(sql).run(...args);
      return Number(result.changes);
    },

    queryAsync: async (
      sql: string,
      args: DbValue[] = [],
    ): Promise<DbRecord[]> => {
      if (opts?.debug) console.debug("[DB] query:", sql, ...args);
      const conn = await getDbConnectionAsync();
      const result = conn.prepare(sql).all(...args);
      return result as DbRecord[];
    },

    transactionAsync: async <T>(
      action: (ctx: DbContext) => Promise<T>,
    ): Promise<T> => {
      if (inTransaction) {
        throw new Error("Nested transactions are not supported");
      }

      const conn = await getDbConnectionAsync();
      if (opts?.debug) console.debug("[DB] BEGIN");
      conn.exec("BEGIN");
      inTransaction = true;
      try {
        const result = await action(dbContext);
        if (opts?.debug) console.debug("[DB] COMMIT");
        conn.exec("COMMIT");
        inTransaction = false;
        return result;
      } catch (error) {
        if (opts?.debug) console.debug("[DB] ROLLBACK");
        conn.exec("ROLLBACK");
        inTransaction = false;
        throw error;
      }
    },

    closeAsync: async () => {
      dbConnection?.close();
      dbConnection = null;
      return await Promise.resolve();
    },

    cleanAsync: async (): Promise<void> => {
      dbConnection?.close();
      dbConnection = null;
      if (dbPath && await fs.exists(dbPath)) {
        await Deno.remove(dbPath);
      }
    },
  };

  return dbContext;
}
