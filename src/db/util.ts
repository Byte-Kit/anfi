import * as config from "@anfi/config.ts";

export async function remove() {
  const dbPath = config.get(config.Key.DbPath);
  if (dbPath) {
    await Deno.remove(dbPath);
  }
}
