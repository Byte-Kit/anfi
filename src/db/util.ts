import * as config from "@anfi/config.ts";
import * as fs from "@std/fs";

export async function removeAsync() {
  const dbPath = config.get(config.Key.DbPath);
  if (!dbPath) {
    return;
  }

  if (await fs.exists(dbPath)) {
    await Deno.remove(dbPath);
  }
}
