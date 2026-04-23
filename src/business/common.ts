import { DbConnection } from "@src/db";

export interface DbService {
  getDbConnection(): DbConnection;
}
