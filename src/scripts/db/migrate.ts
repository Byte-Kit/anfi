import { createSqliteDbContext } from "@anfi/db/context/index.ts";
import { createMigrationRunner } from "@anfi/db/migration.ts";

if (import.meta.main) {
  const dbMigrationPath = Deno.env.get("DB_MIGRATION_PATH");
  if (dbMigrationPath) {
    const dbPath = Deno.env.get("DB_PATH");
    const dbContext = createSqliteDbContext({ path: dbPath });
    const runner = createMigrationRunner(dbContext, {
      pathToMigrations: dbMigrationPath,
    });

    await runner.migrateAsync();
    await dbContext.closeAsync();
  }
}
