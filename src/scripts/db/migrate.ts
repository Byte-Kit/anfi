import { createSqliteDbContext } from "@anfi/db/context/index.ts";
import { createMigrationRunner } from "@anfi/db/migration.ts";

if (import.meta.main) {
  const dbMigrationPath = Deno.env.get("DB_MIGRATION_PATH");

  if (dbMigrationPath) {
    const dbPath = Deno.env.get("DB_PATH");
    const dbContext = dbPath == null
      ? createSqliteDbContext()
      : createSqliteDbContext({ path: dbPath });
    const runner = createMigrationRunner(dbContext);
    await runner.migrateAsync({ pathToMigrations: dbMigrationPath });
    await dbContext.closeAsync();
  }
}
