import { DbContext, DbRecord, DbValue } from "@anfi/db/context/index.ts";
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

  return {
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

    closeAsync: async () => {
      dbConnection?.close();
      dbConnection = null;
      return await Promise.resolve();
    },
    // cleanAsync: async (): Promise<void> => {
    //   dbConnection?.close();
    //   dbConnection = null;
    //   if (!dbPath) {
    //     return;
    //   }
    //   if (await fs.exists(dbPath)) {
    //     await Deno.remove(dbPath);
    //   }
    // },
    // migrateAsync: async (): Promise<void> => {
    //   if (!opts?.pathToMigrations) {
    //     return;
    //   }
    //
    //   const dbConnection = await getDbConnectionAsync();
    //   const pathToMigrations = path.resolvePath(opts.pathToMigrations);
    //   const migrations: string[] = [];
    //
    //   for await (const migrationDir of Deno.readDir(pathToMigrations)) {
    //     if (migrationDir.isDirectory) {
    //       migrations.push(migrationDir.name);
    //     }
    //   }
    //
    //   migrations.sort((a, b) =>
    //     a.localeCompare(b, undefined, { numeric: true })
    //   );
    //
    //   for (const migrationDir of migrations) {
    //     const migrationSql = await Deno.readTextFile(path.join(
    //       pathToMigrations,
    //       migrationDir,
    //       "up.sql",
    //     ));
    //     dbConnection.exec(migrationSql);
    //   }
    // },
  };
}
