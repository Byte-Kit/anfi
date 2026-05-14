import * as schema from "@anfi/business/financial-event.schema.ts";
import { FinancialEventService } from "@anfi/business/financial-event.ts";
import { FinancialEventDao, TransactionDao } from "@anfi/dao";
import * as db from "@anfi/db";
import { Chrono } from "@anfi/lib";
import * as model from "@anfi/model";
import { assertArrayIncludes, assertThrows } from "@std/assert";
import { assertExists } from "@std/assert/exists";
import { assertObjectMatch } from "@std/assert/object-match";
import { beforeAll, beforeEach, describe, it } from "@std/testing/bdd";
import { assertSpyCalls, SpyLike, stub } from "@std/testing/mock";

type Stubs = {
  connectionBuilder: {
    get?: SpyLike;
  };
  financialEventDao: {
    save?: SpyLike;
  };
  transactionDao: {
    save?: SpyLike;
  };
};

describe("FinancialEventService", () => {
  let service: FinancialEventService;
  const stubs: Stubs = {
    connectionBuilder: {},
    financialEventDao: {},
    transactionDao: {},
  };

  beforeAll(() => {
    db.stubDbConnection();
  });

  beforeEach(() => {
    stubs.financialEventDao.save?.restore();
    stubs.financialEventDao.save = stub(
      FinancialEventDao.prototype,
      "save",
      (...entities) => entities.length,
    );

    stubs.transactionDao.save?.restore();
    stubs.transactionDao.save = stub(
      TransactionDao.prototype,
      "save",
      (...entities) => entities.length,
    );

    service = new FinancialEventService();
  });

  describe("create(input)", () => {
    describe("when total amount is not zero", () => {
      it("should throw error", () => {
        const error = assertThrows(() =>
          service.create({
            transactions: [
              {
                type: "Debit",
                amount: 100,
                financialAccountId: crypto.randomUUID(),
              },
              {
                type: "Credit",
                amount: 99,
                financialAccountId: crypto.randomUUID(),
              },
            ],
          })
        );

        assertExists(error);
      });
    });

    describe("", () => {
      const financialEvent: schema.CreateFinancialEvent = {
        timestamp: Chrono.now().toString(),
        description: "",
        transactions: [
          {
            type: "Credit",
            amount: 100,
            financialAccountId: crypto.randomUUID(),
          },
          {
            type: "Debit",
            amount: 100,
            financialAccountId: crypto.randomUUID(),
          },
        ],
      };

      beforeEach(() => {
        stubs.financialEventDao.save?.restore();
        stubs.financialEventDao.save = stub(
          FinancialEventDao.prototype,
          "save",
          (...entities) => entities.length,
        );

        stubs.transactionDao.save?.restore();
        stubs.transactionDao.save = stub(
          TransactionDao.prototype,
          "save",
          (...entities) => entities.length,
        );
        service.create(financialEvent);
      });

      it("should call FinancialEventDao.save", () => {
        assertExists(stubs.financialEventDao.save);
        assertSpyCalls(stubs.financialEventDao.save, 1);

        const actualFinancialEvent: model.FinancialEvent =
          stubs.financialEventDao.save.calls[0].args[0];

        assertObjectMatch(
          actualFinancialEvent,
          {
            timestamp: Chrono.from(financialEvent.timestamp).unix(),
            description: financialEvent.description,
          },
        );
      });

      it("should call TransactionDao.save", () => {
        assertExists(stubs.transactionDao.save);
        assertSpyCalls(stubs.transactionDao.save, 1);
        const actualTransactions: model.Transaction[] =
          stubs.transactionDao.save.calls[0].args;
        assertArrayIncludes(
          actualTransactions.map(({ amount, type, financialAccountId }) => ({
            amount,
            type,
            financialAccountId,
          })),
          financialEvent.transactions.map((
            { amount, type, financialAccountId },
          ) => ({
            amount,
            type,
            financialAccountId,
          })),
        );
      });
    });
  });
});
