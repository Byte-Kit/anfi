import * as db from "@anfi/db";
import { FinancialAccount, FinancialEvent, Transaction } from "@anfi/model";
import { assertArrayIncludes, assertEquals, assertExists } from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { FinancialAccountDao } from "./financial-account.ts";
import { FinancialEventDao } from "./financial-event.ts";
import { TransactionDao } from "./transaction.ts";

describe("TransactionDao", () => {
  let dao!: TransactionDao;
  let financialAccountDao!: FinancialAccountDao;
  let financialEventDao!: FinancialEventDao;

  function createAccount(): FinancialAccount {
    const account = new FinancialAccount({ type: "Asset", name: "Account" });
    financialAccountDao.save(account);
    return account;
  }

  function createEvent(
    id: string | null = null,
  ): FinancialEvent {
    const event = new FinancialEvent(
      { timestamp: 1000000, description: "Event" },
      id,
    );
    financialEventDao.save(event);
    return event;
  }

  function makeTransaction(
    account: FinancialAccount,
    event: FinancialEvent,
    overrides: Partial<{ amount: number; type: "Credit" | "Debit" }> = {},
  ): Transaction {
    return new Transaction({
      amount: overrides.amount ?? 100,
      type: overrides.type ?? "Credit",
      financialAccountId: account.id,
      financialEventId: event.id,
    });
  }

  beforeEach(async () => {
    await db.cleanUpAsync();
    await db.migrateAsync();
    const connection = new db.ConnectionBuilder().get();
    dao = new TransactionDao(connection);
    financialAccountDao = new FinancialAccountDao(connection);
    financialEventDao = new FinancialEventDao(connection);
  });

  describe("save(...entities)", () => {
    describe("when saving non-existent records", () => {
      it("should insert new records", () => {
        const account = createAccount();
        const event = createEvent();
        const insertedCount = dao.save(
          makeTransaction(account, event, { amount: 200, type: "Debit" }),
          makeTransaction(account, event, { amount: 200, type: "Credit" }),
        );
        assertEquals(insertedCount, 2);
      });
    });

    describe("when saving an existing record", () => {
      it("should update the record", () => {
        const account = createAccount();
        const event = createEvent();
        const original = makeTransaction(account, event, {
          amount: 50,
          type: "Debit",
        });
        dao.save(original);

        const updated = new Transaction({
          amount: 150,
          type: "Credit",
          financialAccountId: account.id,
          financialEventId: event.id,
        }, original.id);
        dao.save(updated);

        const actual = dao.getById(original.id);
        assertExists(actual);
        assertEquals(actual.amount, 150);
        assertEquals(actual.type, "Credit");
      });
    });
  });

  describe("getById(id)", () => {
    describe("when a record with the specified ID exists", () => {
      it("should return the found record", () => {
        const account = createAccount();
        const event = createEvent();
        const transaction = makeTransaction(account, event);
        dao.save(transaction);

        const actual = dao.getById(transaction.id);
        assertExists(actual);
        assertEquals(actual.id, transaction.id);
        assertEquals(actual.amount, transaction.amount);
        assertEquals(actual.type, transaction.type);
        assertEquals(actual.financialAccountId, transaction.financialAccountId);
        assertEquals(actual.financialEventId, transaction.financialEventId);
      });
    });

    describe("when no record can be found", () => {
      it("should return null", () => {
        assertEquals(dao.getById(crypto.randomUUID()), null);
      });
    });
  });

  describe("getAll()", () => {
    it("should return all records", () => {
      const account = createAccount();
      const event1 = createEvent();
      const event2 = createEvent();
      const transactions = [
        makeTransaction(account, event1, { amount: 50, type: "Debit" }),
        makeTransaction(account, event2, { amount: 100, type: "Credit" }),
      ];

      dao.save(...transactions);
      assertArrayIncludes(dao.getAll(), transactions);
    });
  });

  describe("deleteByIds(ids)", () => {
    describe("when no ids are provided", () => {
      it("should make no change", () => {
        const account = createAccount();
        const event = createEvent();
        dao.save(makeTransaction(account, event));
        assertEquals(dao.deleteByIds([]), 0);
      });
    });

    describe("when non-empty ids are provided", () => {
      it("should delete records with the specified IDs", () => {
        const account = createAccount();
        const event1 = createEvent();
        const event2 = createEvent();
        const transactions = [
          makeTransaction(account, event1),
          makeTransaction(account, event2),
        ];
        dao.save(...transactions);

        const deletedCount = dao.deleteByIds(transactions.map((t) => t.id));
        assertEquals(deletedCount, transactions.length);
        assertEquals(dao.getAll(), []);
      });
    });
  });

  describe("getByFinancialEventIds(eventIds)", () => {
    describe("when no ids are provided", () => {
      it("should return an empty array", () => {
        assertEquals(dao.getByFinancialEventIds([]), []);
      });
    });

    describe("when one event id is provided", () => {
      it("should return transactions for that event", () => {
        const account = createAccount();
        const event = createEvent();
        const transactions = [
          makeTransaction(account, event, { type: "Credit" }),
          makeTransaction(account, event, { type: "Debit" }),
        ];

        dao.save(...transactions);
        const actual = dao.getByFinancialEventIds([event.id]);
        assertEquals(actual.length, 2);
        assertArrayIncludes(actual, transactions);
      });
    });

    describe("when multiple event ids are provided", () => {
      it("should return transactions for those events", () => {
        const account = createAccount();
        const event1 = createEvent();
        const event2 = createEvent();
        const transactions = [
          makeTransaction(account, event1, { amount: 50, type: "Debit" }),
          makeTransaction(account, event2, { amount: 150, type: "Credit" }),
        ];

        dao.save(...transactions);
        const actual = dao.getByFinancialEventIds([event1.id, event2.id]);
        assertEquals(actual.length, 2);
        assertArrayIncludes(actual, transactions);
      });
    });

    describe("when some ids have no matching transactions", () => {
      it("should only return matching transactions", () => {
        const account = createAccount();
        const event = createEvent();
        const unrelatedEvent = createEvent();
        const transaction = makeTransaction(account, event, { amount: 75 });

        dao.save(transaction);
        const actual = dao.getByFinancialEventIds([
          event.id,
          unrelatedEvent.id,
        ]);
        assertEquals(actual.length, 1);
        assertEquals(actual[0].id, transaction.id);
      });
    });
  });
});
