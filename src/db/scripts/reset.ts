import * as db from "@anfi/db";
await db.cleanUpAsync();
await db.migrateAsync();
