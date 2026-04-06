import { DatabaseSync } from "node:sqlite";
import * as config from "@anfi/config.ts";
import { collect } from "@anfi/lib/collection.ts";

export function connect() {
  const dbPath = config.get(config.Key.DbPath);

  if (dbPath == null) {
    return new DatabaseSync(":memory:");
  }

  const dbPathDir = collect(dbPath.split("/")).withoutLast().join("/");
  Deno.mkdirSync(dbPathDir, { recursive: true });
  return new DatabaseSync(dbPath);
}

export class ConnectionBuilder {
  get() {
    return connect();
  }
}
