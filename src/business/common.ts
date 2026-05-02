import * as db from "@anfi/db";

export interface DbService {
  getDbConnection(): db.DbConnection;
}

export class BusinessService implements DbService {
  getDbConnection(): db.DbConnection {
    return new db.ConnectionBuilder().get();
  }
}
