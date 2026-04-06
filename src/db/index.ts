import { DatabaseSync, SQLOutputValue } from "node:sqlite";

export { connect, ConnectionBuilder } from "./connection.ts";
export { migrateAsync } from "./migration.ts";
export { removeAsync } from "./util.ts";

export type DbRecord = Record<string, SQLOutputValue>;
export type DbConnection = DatabaseSync;
