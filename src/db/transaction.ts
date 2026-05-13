import { DbConnection } from "./common.ts";
import { ConnectionBuilder } from "./connection.ts";

export function transact(
  cb: (conn: DbConnection) => void,
  conn?: DbConnection,
) {
  if (!conn) {
    conn = new ConnectionBuilder().get();
  }

  conn.exec("BEGIN TRANSACTION");
  try {
    cb(conn);
    conn.exec("COMMIT");
  } catch (e) {
    conn.exec("ROLLBACK");
    throw e;
  } finally {
    conn.close();
  }
}
