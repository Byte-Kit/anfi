import { DbContext } from "@anfi/db/context/index.ts";
import * as fs from "@anfi/lib/fs.ts";
import * as path from "@anfi/lib/path.ts";

export type MigrationOpts = {
  pathToMigrations: string;
  debug?: boolean;
};

export type MigrationRunner = {
  migrateAsync: (opts: MigrationOpts) => Promise<void>;
};

export function createMigrationRunner(context: DbContext): MigrationRunner {
  return {
    migrateAsync: async (opts: MigrationOpts) => {
      const resolvedPath = path.resolvePath(opts.pathToMigrations);
      const migrations: string[] = [];

      if (opts.debug) {
        console.debug("[Migration] Starting migration from:", resolvedPath);
      }

      for await (const entry of Deno.readDir(resolvedPath)) {
        if (
          entry.isDirectory
          && await fs.exists(path.join(resolvedPath, entry.name, "up.sql"))
          && await fs.exists(path.join(resolvedPath, entry.name, "down.sql"))
        ) {
          migrations.push(entry.name);
        }
      }

      migrations.sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true })
      );

      for (const name of migrations) {
        if (opts.debug) {
          console.debug("[Migration] Running migration:", name);
        }

        const scriptPath = path.join(resolvedPath, name, "up.sql");
        const scriptContent = await Deno.readTextFile(scriptPath);
        for (
          const statement of scriptContent
            .split(";")
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
        ) {
          await context.executeAsync(statement);
        }

        if (opts.debug) {
          console.debug("[Migration] Finished migration:", name);
        }
      }
    },
  };
}
