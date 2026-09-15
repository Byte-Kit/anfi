import { createSqliteDbContext, DbContext } from "@anfi/db/context/index.ts";

export function createSqliteDbContextFromEnv(): DbContext {
  const path = Deno.env.get("DB_PATH");
  const pathToMigrations = Deno.env.get("DB_MIGRATION_PATH");
  const debug = Deno.env.get("DB_DEBUG") === "true"
    || Deno.env.get("DB_DEBUG") === "1";

  return createSqliteDbContext({
    path: path ?? undefined,
    pathToMigrations: pathToMigrations ?? undefined,
    debug,
  });
}
