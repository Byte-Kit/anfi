import { DatabaseSync, SQLOutputValue } from "node:sqlite";

export { connect } from "./connection.ts";
export { removeAsync } from "./util.ts";
export { migrateAsync } from "./migration.ts";

export type DbRecord = Record<string, SQLOutputValue>;
export type DbConnection = DatabaseSync;
