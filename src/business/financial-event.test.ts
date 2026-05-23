import * as schema from "@anfi/business/financial-event.schema.ts";
import { FinancialEventService } from "@anfi/business/financial-event.ts";
import {
  FinancialAccountDao,
  FinancialEventDao,
  TransactionDao,
} from "@anfi/dao";
import * as db from "@anfi/db";
import { Chrono } from "@anfi/lib";
import * as model from "@anfi/model";
import { assertArrayIncludes, assertEquals, assertThrows } from "@std/assert";
import { assertExists } from "@std/assert/exists";
import { assertObjectMatch } from "@std/assert/object-match";
import { beforeAll, beforeEach, describe, it } from "@std/testing/bdd";
import {
  assertSpyCall,
  assertSpyCalls,
  SpyLike,
  stub,
} from "@std/testing/mock";

type Stubs = {
  connectionBuilder: {
    get?: SpyLike;
  };
  financialEventDao: {
    save?: SpyLike;
    getAll?: SpyLike;
  };
  transactionDao: {
    save?: SpyLike;
    getByFinancialEventIds?: SpyLike;
  };
  financialAccountDao: {
    getById?: SpyLike;
  };
};

describe("FinancialEventService", () => {
  let service: FinancialEventService;
  const stubs: Stubs = {
    connectionBuilder: {},
    financialEventDao: {},
    transactionDao: {},
    financialAccountDao: {},
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

  describe("list()", () => {
    const eventIdentifier = crypto.randomUUID();
    const creditAccountIdentifier = crypto.randomUUID();
    const debitAccountIdentifier = crypto.randomUUID();

    const financialEvent = new model.FinancialEvent({
      timestamp: 1000000,
      description: "Test transaction",
    }, eventIdentifier);

    const creditTransaction = new model.Transaction({
      amount: 500,
      type: "Credit",
      financialAccountId: creditAccountIdentifier,
      financialEventId: eventIdentifier,
    });

    const debitTransaction = new model.Transaction({
      amount: 500,
      type: "Debit",
      financialAccountId: debitAccountIdentifier,
      financialEventId: eventIdentifier,
    });

    const sourceAccount = new model.FinancialAccount({
      name: "Checking",
      type: "Asset",
    }, creditAccountIdentifier);

    const targetAccount = new model.FinancialAccount({
      name: "Savings",
      type: "Asset",
    }, debitAccountIdentifier);

    beforeEach(() => {
      stubs.financialEventDao.getAll?.restore();
      stubs.financialEventDao.getAll = stub(
        FinancialEventDao.prototype,
        "getAll",
        () => [financialEvent],
      );

      stubs.transactionDao.getByFinancialEventIds?.restore();
      stubs.transactionDao.getByFinancialEventIds = stub(
        TransactionDao.prototype,
        "getByFinancialEventIds",
        (_eventIds: string[]) => [creditTransaction, debitTransaction],
      );

      stubs.financialAccountDao.getById?.restore();
      stubs.financialAccountDao.getById = stub(
        FinancialAccountDao.prototype,
        "getById",
        (identifier: string) => {
          if (identifier === creditAccountIdentifier) return sourceAccount;
          if (identifier === debitAccountIdentifier) return targetAccount;
          return null;
        },
      );
    });

    it("should call FinancialEventDao.getAll", () => {
      const actual = service.list();

      assertExists(stubs.financialEventDao.getAll);
      assertSpyCalls(stubs.financialEventDao.getAll, 1);

      assertExists(actual);
    });

    it("should call TransactionDao.getByFinancialEventIds with all event ids", () => {
      service.list();

      assertExists(stubs.transactionDao.getByFinancialEventIds);
      assertSpyCalls(stubs.transactionDao.getByFinancialEventIds, 1);
      assertSpyCall(stubs.transactionDao.getByFinancialEventIds, 0, {
        args: [[eventIdentifier]],
      });
    });

    it("should call FinancialAccountDao.getById for each transaction account", () => {
      service.list();

      assertExists(stubs.financialAccountDao.getById);
      assertSpyCalls(stubs.financialAccountDao.getById, 2);
      const firstCallIdentifier =
        stubs.financialAccountDao.getById.calls[0].args[0];
      const secondCallIdentifier =
        stubs.financialAccountDao.getById.calls[1].args[0];
      assertEquals(firstCallIdentifier, creditAccountIdentifier);
      assertEquals(secondCallIdentifier, debitAccountIdentifier);
    });

    it("should return the correct financial event list items", () => {
      const actual = service.list();

      assertEquals(actual.length, 1);
      assertObjectMatch(
        actual[0],
        {
          timestamp: Chrono.fromUnix(financialEvent.timestamp).toString(),
          sourceAccountName: sourceAccount.name,
          targetAccountName: targetAccount.name,
          amount: creditTransaction.amount,
          description: financialEvent.description,
        },
      );
    });

    describe("when source account is missing", () => {
      beforeEach(() => {
        stubs.financialAccountDao.getById?.restore();
        stubs.financialAccountDao.getById = stub(
          FinancialAccountDao.prototype,
          "getById",
          () => null,
        );
      });

      it("should throw an error", () => {
        assertThrows(() => service.list());
      });
    });

    describe("when target account is missing", () => {
      beforeEach(() => {
        stubs.financialAccountDao.getById?.restore();
        stubs.financialAccountDao.getById = stub(
          FinancialAccountDao.prototype,
          "getById",
          (identifier: string) =>
            identifier === creditAccountIdentifier ? sourceAccount : null,
        );
      });

      it("should throw an error", () => {
        assertThrows(() => service.list());
      });
    });
  });
});
