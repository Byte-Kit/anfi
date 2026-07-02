import type { DbRecord, DbValue } from "@anfi/db/common.ts";

export type DbContext = {
  executeAsync: (sql: string, args?: DbValue[]) => Promise<number>;
  queryAsync: (sql: string, args?: DbValue[]) => Promise<DbRecord[]>;
  transactionAsync: <T>(action: (ctx: DbContext) => Promise<T>) => Promise<T>;
  closeAsync: () => Promise<void>;
  cleanAsync: () => Promise<void>;
};

export * from "./sqlite.ts";
