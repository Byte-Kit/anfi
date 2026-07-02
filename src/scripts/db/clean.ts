import { createSqliteDbContext } from "@anfi/db/context/index.ts";

if (import.meta.main) {
  const dbPath = Deno.env.get("DB_PATH");
  const dbContext = dbPath == null
    ? createSqliteDbContext()
    : createSqliteDbContext({ path: dbPath });
  await dbContext.cleanAsync();
  await dbContext.closeAsync();
}
