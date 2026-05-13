import * as config from "@anfi/config.ts";
import * as fs from "@std/fs";

/**
 * Remove a dabatase instance. Useful for running tests.
 */
export async function cleanUpAsync() {
  const dbPath = config.get(config.Key.DbPath);
  if (!dbPath) {
    return;
  }

  if (await fs.exists(dbPath)) {
    await Deno.remove(dbPath);
  }
}
