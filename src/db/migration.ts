import * as config from "@anfi/config.ts";
import * as dbConnection from "./connection.ts";

/**
 * Execute SQL migration scripts from a directory,
 * configured using{@link config.Key.DbMigrationPath}
 *
 * Each migration entry are expected to be structured
 * as a directory with two files: up.sql and down.sql.
 *
 * Entries are sorted in alphabetical order.
 */
export async function migrate() {
  const connection = dbConnection.connect();
  const migrationsPath = config.get(config.Key.DbMigrationPath);

  if (migrationsPath === null) {
    return;
  }

  for await (const migration of Deno.readDir(migrationsPath)) {
    if (!migration.isDirectory) {
      continue;
    }

    const pathToMigration = `${migrationsPath}/${migration.name}/up.sql`;
    const migrationScript = await Deno.readTextFile(pathToMigration);
    connection.exec(migrationScript);
  }
}
