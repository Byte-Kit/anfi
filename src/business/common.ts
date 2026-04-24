import { DbConnection } from "@anfi/db";

export interface DbService {
  getDbConnection(): DbConnection;
}
