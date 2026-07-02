export type DbValue = string | number | null;
export type DbRecord = Record<string, DbValue>;

export type DbContext = {
  executeAsync: (sql: string, args?: DbValue[]) => Promise<number>;
  queryAsync: (sql: string, args?: DbValue[]) => Promise<DbRecord[]>;
  closeAsync: () => Promise<void>;
};

export * from "./sqlite.ts";
