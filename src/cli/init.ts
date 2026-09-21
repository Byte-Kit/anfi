import {
  createMigrationRunnerFromEnv,
  createSqliteDbContextFromEnv,
} from "@anfi/cli/services/db.ts";

export async function migrateDb() {
  const dbContext = createSqliteDbContextFromEnv();
  try {
    const runner = createMigrationRunnerFromEnv(dbContext);
    await runner.migrateAsync();
  } finally {
    await dbContext.closeAsync();
  }
}
