import * as config from "@anfi/config.ts";
import { collect } from "@anfi/lib/collection.ts";
import { DatabaseSync } from "node:sqlite";

/**
 * Builder for database connection.
 */
export class ConnectionBuilder {
  get() {
    const dbPath = config.get(config.Key.DbPath);

    if (dbPath == null) {
      return new DatabaseSync(":memory:");
    }

    const dbPathDir = collect(dbPath.split("/")).withoutLast().join("/");
    Deno.mkdirSync(dbPathDir, { recursive: true });
    return new DatabaseSync(dbPath);
  }
}
