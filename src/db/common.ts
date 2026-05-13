import { DatabaseSync, SQLOutputValue } from "node:sqlite";

export type DbRecord = Record<string, SQLOutputValue>;
export type DbConnection = DatabaseSync;
