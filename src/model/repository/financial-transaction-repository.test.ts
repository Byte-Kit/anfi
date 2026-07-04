import { createSqliteDbContext, DbContext } from "@anfi/db/context/index.ts";
import {
  FinancialAccount,
  FinancialEvent,
  FinancialTransaction,
} from "@anfi/model";
import { assertArrayIncludes, assertEquals, assertExists } from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";
import {
  createTransactionRepository,
  FinancialTransactionRepository,
} from "./financial-transaction-repository.ts";

describe("FinancialTransactionRepository", () => {
  let dbContext!: DbContext;
  let repo!: FinancialTransactionRepository;

  async function createAccount(id: string): Promise<string> {
    const account: FinancialAccount = {
      id,
      type: "Asset",
      name: "Account",
    };
    await dbContext.executeAsync(
      "INSERT INTO financial_account (id, type, name) VALUES (?, ?, ?)",
      [account.id, account.type, account.name],
    );
    return account.id;
  }

  async function createEvent(id: string | null = null): Promise<string> {
    const event: FinancialEvent = {
      id: id ?? crypto.randomUUID(),
      timestamp: 1000000,
      description: "Event",
    };
    await dbContext.executeAsync(
      "INSERT INTO financial_event (id, timestamp, description) VALUES (?, ?, ?)",
      [event.id, event.timestamp, event.description],
    );
    return event.id;
  }

  function makeTransaction(
    accountId: string,
    eventId: string,
    overrides: Partial<{ amount: number; type: "Credit" | "Debit" }> = {},
  ): FinancialTransaction {
    return {
      id: crypto.randomUUID(),
      amount: overrides.amount ?? 100,
      type: overrides.type ?? "Credit",
      financialAccountId: accountId,
      financialEventId: eventId,
    };
  }

  beforeEach(async () => {
    dbContext = createSqliteDbContext();
    await dbContext.executeAsync(
      `CREATE TABLE IF NOT EXISTS financial_account (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        name TEXT NOT NULL
      )`,
    );
    await dbContext.executeAsync(
      `CREATE TABLE IF NOT EXISTS financial_event (
        id TEXT PRIMARY KEY,
        timestamp INTEGER NOT NULL,
        description TEXT NOT NULL
      )`,
    );
    await dbContext.executeAsync(
      `CREATE TABLE IF NOT EXISTS financial_transaction (
        id TEXT PRIMARY KEY,
        amount REAL NOT NULL,
        type TEXT NOT NULL,
        financial_account_id TEXT NOT NULL,
        financial_event_id TEXT NOT NULL
      )`,
    );
    repo = createTransactionRepository(dbContext);
  });

  describe("saveAsync", () => {
    describe("when saving non-existent records", () => {
      it("should insert new records", async () => {
        const accountId = await createAccount("a1");
        const eventId = await createEvent();

        const insertedCount = await repo.saveAsync(
          makeTransaction(accountId, eventId, { amount: 200, type: "Debit" }),
          makeTransaction(accountId, eventId, { amount: 200, type: "Credit" }),
        );

        assertEquals(insertedCount, 2);
      });
    });

    describe("when saving an existing record", () => {
      it("should update the record", async () => {
        const accountId = await createAccount("a1");
        const eventId = await createEvent();
        const original = makeTransaction(accountId, eventId, {
          amount: 50,
          type: "Debit",
        });
        await repo.saveAsync(original);

        const updated: FinancialTransaction = {
          id: original.id,
          amount: 150,
          type: "Credit",
          financialAccountId: accountId,
          financialEventId: eventId,
        };
        await repo.saveAsync(updated);

        const actual = await repo.getByIdAsync(original.id);
        assertExists(actual);
        assertEquals(actual.amount, 150);
        assertEquals(actual.type, "Credit");
      });
    });
  });

  describe("getByIdAsync", () => {
    describe("when a record with the specified ID exists", () => {
      it("should return the found record", async () => {
        const accountId = await createAccount("a1");
        const eventId = await createEvent();
        const transaction = makeTransaction(accountId, eventId);
        await repo.saveAsync(transaction);

        const actual = await repo.getByIdAsync(transaction.id);
        assertExists(actual);
        assertEquals(actual.id, transaction.id);
        assertEquals(actual.amount, transaction.amount);
        assertEquals(actual.type, transaction.type);
        assertEquals(actual.financialAccountId, transaction.financialAccountId);
        assertEquals(actual.financialEventId, transaction.financialEventId);
      });
    });

    describe("when no record can be found", () => {
      it("should return null", async () => {
        assertEquals(await repo.getByIdAsync(crypto.randomUUID()), null);
      });
    });
  });

  describe("getAllAsync", () => {
    it("should return all records", async () => {
      const accountId = await createAccount("a1");
      const event1Id = await createEvent();
      const event2Id = await createEvent();
      const transactions = [
        makeTransaction(accountId, event1Id, { amount: 50, type: "Debit" }),
        makeTransaction(accountId, event2Id, { amount: 100, type: "Credit" }),
      ];

      await repo.saveAsync(...transactions);
      assertArrayIncludes(await repo.getAllAsync(), transactions);
    });
  });

  describe("deleteByIdsAsync", () => {
    describe("when no ids are provided", () => {
      it("should make no change", async () => {
        const accountId = await createAccount("a1");
        const eventId = await createEvent();
        await repo.saveAsync(makeTransaction(accountId, eventId));

        assertEquals(await repo.deleteByIdsAsync([]), 0);
      });
    });

    describe("when non-empty ids are provided", () => {
      it("should delete records with the specified IDs", async () => {
        const accountId = await createAccount("a1");
        const eventId1 = await createEvent();
        const eventId2 = await createEvent();
        const transactions = [
          makeTransaction(accountId, eventId1),
          makeTransaction(accountId, eventId2),
        ];
        await repo.saveAsync(...transactions);

        const deletedCount = await repo.deleteByIdsAsync(
          transactions.map((t) => t.id),
        );
        assertEquals(deletedCount, transactions.length);
        assertEquals(await repo.getAllAsync(), []);
      });
    });
  });

  describe("getByFinancialEventIds", () => {
    describe("when no ids are provided", () => {
      it("should return an empty array", async () => {
        assertEquals(await repo.getByFinancialEventIds([]), []);
      });
    });

    describe("when one event id is provided", () => {
      it("should return transactions for that event", async () => {
        const accountId = await createAccount("a1");
        const eventId = await createEvent();
        const transactions = [
          makeTransaction(accountId, eventId, { type: "Credit" }),
          makeTransaction(accountId, eventId, { type: "Debit" }),
        ];

        await repo.saveAsync(...transactions);
        const actual = await repo.getByFinancialEventIds([eventId]);
        assertEquals(actual.length, 2);
        assertArrayIncludes(actual, transactions);
      });
    });

    describe("when multiple event ids are provided", () => {
      it("should return transactions for those events", async () => {
        const accountId = await createAccount("a1");
        const event1Id = await createEvent();
        const event2Id = await createEvent();
        const transactions = [
          makeTransaction(accountId, event1Id, { amount: 50, type: "Debit" }),
          makeTransaction(accountId, event2Id, { amount: 150, type: "Credit" }),
        ];

        await repo.saveAsync(...transactions);
        const actual = await repo.getByFinancialEventIds([
          event1Id,
          event2Id,
        ]);
        assertEquals(actual.length, 2);
        assertArrayIncludes(actual, transactions);
      });
    });

    describe("when some ids have no matching transactions", () => {
      it("should only return matching transactions", async () => {
        const accountId = await createAccount("a1");
        const eventId = await createEvent();
        const unrelatedEventId = await createEvent();
        const transaction = makeTransaction(accountId, eventId, { amount: 75 });

        await repo.saveAsync(transaction);
        const actual = await repo.getByFinancialEventIds([
          eventId,
          unrelatedEventId,
        ]);
        assertEquals(actual.length, 1);
        assertEquals(actual[0].id, transaction.id);
      });
    });
  });
});
