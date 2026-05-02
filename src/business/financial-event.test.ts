import * as db from "@anfi/db";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { SpyLike, stub } from "@std/testing/mock";
import { FinancialEventService } from "@anfi/business/financial-event.ts";
import { assertThrows } from "@std/assert";

type Stubs = {
  connectionBuilder: {
    get?: SpyLike;
  };
};

describe("FinancialEventService", () => {
  let service: FinancialEventService;
  const stubs: Stubs = {
    connectionBuilder: {},
  };

  beforeEach(() => {
    stubs.connectionBuilder.get?.restore();
    stubs.connectionBuilder.get = stub(
      db.ConnectionBuilder.prototype,
      "get",
      () => ({} as db.DbConnection),
    );

    service = new FinancialEventService();
  });

  describe("create(input)", () => {
    it("should throw NOT_IMPLEMENTED error", () => {
      assertThrows(() =>
        service.create({
          transactions: [],
        })
      );
    });
  });
});
