import { assert, assertExists } from "@std/assert";
import { afterAll, afterEach, beforeAll, describe, it } from "@std/testing/bdd";
import { SpyLike, stub } from "@std/testing/mock";
import * as Config from "@anfi/config.ts";
import * as dbConnection from "./connection.ts";
import * as dbUtil from "./util.ts";

describe("connection", () => {
  describe("connect()", () => {
    describe(`when DbPath is not set`, () => {
      const spies: SpyLike[] = [];
      beforeAll(() => {
        spies.push(
          stub(Deno.env, "get", () => undefined),
        );
      });

      afterAll(() => {
        spies.forEach((spy) => spy.restore());
      });

      it("should initialize an in-memory database", () => {
        assertExists(dbConnection.connect());
      });
    });

    describe(`when ${Config.Key.DbPath} is set`, () => {
      afterEach(async () => {
        await dbUtil.remove();
      });

      it("should initialize a database at the location defined by DB_PATH", async () => {
        assertExists(dbConnection.connect());
        const actualPathToDbFile = await Deno.stat(
          Config.get(Config.Key.DbPath) as string,
        );
        assert(actualPathToDbFile.isFile);
      });
    });
  });
});
