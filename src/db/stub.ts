import { stub } from "@std/testing/mock";
import { DbConnection } from "./common.ts";
import { ConnectionBuilder } from "./connection.ts";

/**
 * Stubs the database connection for testing purposes.
 * @example
 * ```ts
 * beforeEach(() => {
 *  stubDbConnection();
 * })
 *
 * it("bar should foo", () => {
 *  const stubConnection = new ConnectionBuilder().get();
 * })
 * ```
 */
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
