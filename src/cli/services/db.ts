import {
  createMigrationRunner,
  createSqliteDbContext,
  DbContext,
  MigrationRunner,
} from "@anfi/db";

export function createSqliteDbContextFromEnv(): DbContext {
  const path = Deno.env.get("DB_PATH");
  const debug = Deno.env.get("DB_DEBUG") === "true"
    || Deno.env.get("DB_DEBUG") === "1";

  return createSqliteDbContext({
    path: path ?? undefined,
    debug,
  });
}

export function createMigrationRunnerFromEnv(
  dbContext: DbContext,
): MigrationRunner {
  return createMigrationRunner(dbContext, {
    pathToMigrations: Deno.env.get("DB_MIGRATION_PATH") ?? "./migrations",
  });
}
