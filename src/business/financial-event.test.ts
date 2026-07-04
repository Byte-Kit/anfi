import * as schema from "@anfi/business/financial-event.schema.ts";
import { FinancialEventService } from "@anfi/business/financial-event.ts";
import { DbContext } from "@anfi/db/context/index.ts";
import { Chrono } from "@anfi/lib";
import * as model from "@anfi/model";
import {
  FinancialAccountRepository,
  FinancialEventRepository,
  FinancialTransactionRepository,
} from "@anfi/model/repository";
import { assertArrayIncludes, assertEquals, assertRejects } from "@std/assert";
import { assertExists } from "@std/assert/exists";
import { assertObjectMatch } from "@std/assert/object-match";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertSpyCall, assertSpyCalls, Spy, spy } from "@std/testing/mock";

describe("FinancialEventService", () => {
  let mockEventRepo: FinancialEventRepository;
  let mockTxnRepo: FinancialTransactionRepository;
  let mockAccountRepo: FinancialAccountRepository;
  let eventSaveSpy: Spy;
  let txnSaveSpy: Spy;
  let eventGetAllSpy: Spy;
  let txnGetByEventIdsSpy: Spy;
  let accountGetByIdSpy: Spy;
  let service: FinancialEventService;

  function createMockRepos() {
    eventSaveSpy = spy(
      (..._entities: model.FinancialEvent[]): Promise<number> =>
        Promise.resolve(0),
    );
    eventGetAllSpy = spy(
      (): Promise<model.FinancialEvent[]> => Promise.resolve([]),
    );
    const eventGetByIdSpy = spy(
      (_id: string): Promise<model.FinancialEvent | null> =>
        Promise.resolve(null),
    );
    const eventGetByIdsSpy = spy(
      (): Promise<model.FinancialEvent[]> => Promise.resolve([]),
    );
    const eventDeleteSpy = spy(
      (_ids: string[]): Promise<number> => Promise.resolve(0),
    );

    mockEventRepo = {
      saveAsync: eventSaveSpy,
      getAllAsync: eventGetAllSpy,
      getByIdAsync: eventGetByIdSpy,
      getByIdsAsync: eventGetByIdsSpy,
      deleteByIdsAsync: eventDeleteSpy,
    } as FinancialEventRepository;

    txnSaveSpy = spy(
      (..._entities: model.FinancialTransaction[]): Promise<number> =>
        Promise.resolve(0),
    );
    const txnGetAllSpy = spy(
      (): Promise<model.FinancialTransaction[]> => Promise.resolve([]),
    );
    const txnGetByIdSpy = spy(
      (_id: string): Promise<model.FinancialTransaction | null> =>
        Promise.resolve(null),
    );
    const txnGetByIdsSpy = spy(
      (): Promise<model.FinancialTransaction[]> => Promise.resolve([]),
    );
    const txnDeleteSpy = spy(
      (_ids: string[]): Promise<number> => Promise.resolve(0),
    );
    txnGetByEventIdsSpy = spy(
      (_ids: string[]): Promise<model.FinancialTransaction[]> =>
        Promise.resolve([]),
    );

    mockTxnRepo = {
      saveAsync: txnSaveSpy,
      getAllAsync: txnGetAllSpy,
      getByIdAsync: txnGetByIdSpy,
      getByIdsAsync: txnGetByIdsSpy,
      deleteByIdsAsync: txnDeleteSpy,
      getByFinancialEventIds: txnGetByEventIdsSpy,
    } as FinancialTransactionRepository;

    accountGetByIdSpy = spy(
      (_id: string): Promise<model.FinancialAccount | null> =>
        Promise.resolve(null),
    );
    const accountSaveSpy = spy(
      (..._entities: model.FinancialAccount[]): Promise<number> =>
        Promise.resolve(0),
    );
    const accountGetAllSpy = spy(
      (): Promise<model.FinancialAccount[]> => Promise.resolve([]),
    );
    const accountGetByIdsSpy = spy(
      (): Promise<model.FinancialAccount[]> => Promise.resolve([]),
    );
    const accountDeleteSpy = spy(
      (_ids: string[]): Promise<number> => Promise.resolve(0),
    );

    mockAccountRepo = {
      saveAsync: accountSaveSpy,
      getAllAsync: accountGetAllSpy,
      getByIdAsync: accountGetByIdSpy,
      getByIdsAsync: accountGetByIdsSpy,
      deleteByIdsAsync: accountDeleteSpy,
    } as FinancialAccountRepository;
  }

  function createService() {
    const mockDbContext = {
      executeAsync: (): Promise<number> => Promise.resolve(0),
      queryAsync: (): Promise<[]> => Promise.resolve([]),
      transactionAsync: async <T>(
        action: (ctx: DbContext) => Promise<T>,
      ): Promise<T> => {
        return await action(mockDbContext as unknown as DbContext);
      },
      closeAsync: async (): Promise<void> => {},
      cleanAsync: async (): Promise<void> => {},
    } as DbContext;

    service = new FinancialEventService(
      mockEventRepo,
      mockTxnRepo,
      mockAccountRepo,
      mockDbContext,
    );
  }

  beforeEach(() => {
    createMockRepos();
    createService();
  });

  describe("create(input)", () => {
    describe("when total amount is not zero", () => {
      it("should throw error", async () => {
        await assertRejects(() =>
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

      beforeEach(async () => {
        createMockRepos();

        eventSaveSpy = spy(
          (..._entities: model.FinancialEvent[]): Promise<number> =>
            Promise.resolve(1),
        );
        mockEventRepo.saveAsync = eventSaveSpy;

        txnSaveSpy = spy(
          (..._entities: model.FinancialTransaction[]): Promise<number> =>
            Promise.resolve(1),
        );
        mockTxnRepo.saveAsync = txnSaveSpy;

        createService();
        await service.create(financialEvent);
      });

      it("should call FinancialEventRepository.saveAsync", () => {
        assertSpyCalls(eventSaveSpy, 1);

        const actualFinancialEvent: model.FinancialEvent =
          eventSaveSpy.calls[0].args[0];

        assertObjectMatch(
          actualFinancialEvent,
          {
            timestamp: Chrono.from(financialEvent.timestamp).unix(),
            description: financialEvent.description,
          },
        );
      });

      it("should call FinancialTransactionRepository.saveAsync", () => {
        assertSpyCalls(txnSaveSpy, 1);
        const actualTransactions: model.FinancialTransaction[] = txnSaveSpy
          .calls[0]
          .args as unknown as model.FinancialTransaction[];
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

      describe("when saving the financial event fails", () => {
        beforeEach(async () => {
          createMockRepos();

          eventSaveSpy = spy(
            (..._entities: model.FinancialEvent[]): Promise<number> =>
              Promise.reject("DB error"),
          );
          mockEventRepo.saveAsync = eventSaveSpy;

          createService();
          await assertRejects(
            () => service.create(financialEvent),
          );
        });

        it("should rethrow the error", () => {
          assertSpyCalls(eventSaveSpy, 1);
        });
      });
    });
  });

  describe("list()", () => {
    const eventIdentifier = crypto.randomUUID();
    const creditAccountIdentifier = crypto.randomUUID();
    const debitAccountIdentifier = crypto.randomUUID();

    const financialEvent: model.FinancialEvent = {
      id: eventIdentifier,
      timestamp: 1000000,
      description: "Test transaction",
    };

    const creditTransaction: model.FinancialTransaction = {
      id: crypto.randomUUID(),
      amount: 500,
      type: "Credit",
      financialAccountId: creditAccountIdentifier,
      financialEventId: eventIdentifier,
    };

    const debitTransaction: model.FinancialTransaction = {
      id: crypto.randomUUID(),
      amount: 500,
      type: "Debit",
      financialAccountId: debitAccountIdentifier,
      financialEventId: eventIdentifier,
    };

    const sourceAccount: model.FinancialAccount = {
      id: creditAccountIdentifier,
      name: "Checking",
      type: "Asset",
    };

    const targetAccount: model.FinancialAccount = {
      id: debitAccountIdentifier,
      name: "Savings",
      type: "Asset",
    };

    beforeEach(() => {
      createMockRepos();

      eventGetAllSpy = spy(
        () => Promise.resolve([financialEvent]),
      );
      mockEventRepo.getAllAsync = eventGetAllSpy;

      txnGetByEventIdsSpy = spy(
        (_eventIds: string[]) =>
          Promise.resolve([creditTransaction, debitTransaction]),
      );
      mockTxnRepo.getByFinancialEventIds = txnGetByEventIdsSpy;

      accountGetByIdSpy = spy(
        (id: string) => {
          if (id === creditAccountIdentifier) {
            return Promise.resolve(sourceAccount);
          }
          if (id === debitAccountIdentifier) {
            return Promise.resolve(targetAccount);
          }
          return Promise.resolve(null);
        },
      );
      mockAccountRepo.getByIdAsync = accountGetByIdSpy;

      service = new FinancialEventService(
        mockEventRepo,
        mockTxnRepo,
        mockAccountRepo,
      );
    });

    it("should call FinancialEventRepository.getAllAsync", async () => {
      const actual = await service.list();

      assertSpyCalls(eventGetAllSpy, 1);
      assertExists(actual);
    });

    it("should call FinancialTransactionRepository.getByFinancialEventIds with all event ids", async () => {
      await service.list();

      assertSpyCalls(txnGetByEventIdsSpy, 1);
      assertSpyCall(txnGetByEventIdsSpy, 0, {
        args: [[eventIdentifier]],
      });
    });

    it("should call FinancialAccountRepository.getByIdAsync for each transaction account", async () => {
      await service.list();

      assertSpyCalls(accountGetByIdSpy, 2);
      const firstCallIdentifier = accountGetByIdSpy.calls[0].args[0];
      const secondCallIdentifier = accountGetByIdSpy.calls[1].args[0];
      assertEquals(firstCallIdentifier, creditAccountIdentifier);
      assertEquals(secondCallIdentifier, debitAccountIdentifier);
    });

    it("should return the correct financial event list items", async () => {
      const actual = await service.list();

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
        createMockRepos();

        eventGetAllSpy = spy(
          () => Promise.resolve([financialEvent]),
        );
        mockEventRepo.getAllAsync = eventGetAllSpy;

        txnGetByEventIdsSpy = spy(
          () => Promise.resolve([creditTransaction, debitTransaction]),
        );
        mockTxnRepo.getByFinancialEventIds = txnGetByEventIdsSpy;

        accountGetByIdSpy = spy(
          () => Promise.resolve(null),
        );
        mockAccountRepo.getByIdAsync = accountGetByIdSpy;

        service = new FinancialEventService(
          mockEventRepo,
          mockTxnRepo,
          mockAccountRepo,
        );
      });

      it("should throw an error", async () => {
        await assertRejects(() => service.list());
      });
    });

    describe("when target account is missing", () => {
      beforeEach(() => {
        createMockRepos();

        eventGetAllSpy = spy(
          () => Promise.resolve([financialEvent]),
        );
        mockEventRepo.getAllAsync = eventGetAllSpy;

        txnGetByEventIdsSpy = spy(
          () => Promise.resolve([creditTransaction, debitTransaction]),
        );
        mockTxnRepo.getByFinancialEventIds = txnGetByEventIdsSpy;

        accountGetByIdSpy = spy(
          (id: string) => {
            return id === creditAccountIdentifier
              ? Promise.resolve(sourceAccount)
              : Promise.resolve(null);
          },
        );
        mockAccountRepo.getByIdAsync = accountGetByIdSpy;

        service = new FinancialEventService(
          mockEventRepo,
          mockTxnRepo,
          mockAccountRepo,
        );
      });

      it("should throw an error", async () => {
        await assertRejects(() => service.list());
      });
    });
  });
});
