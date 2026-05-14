import { stub } from "@std/testing/mock";
import { DbConnection } from "./common.ts";
import { ConnectionBuilder } from "./connection.ts";

export function stubDbConnection() {
  stub(
    ConnectionBuilder.prototype,
    "get",
    () =>
      ({
        exec: () => {},
        close: () => {},
      }) as unknown as DbConnection,
  );
}
