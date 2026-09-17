import { FinancialAccount } from "@anfi/model";
import { FinancialAccountRepository } from "@anfi/model/repository";
import { assertArrayIncludes, assertEquals } from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertSpyCall, assertSpyCalls, Spy, spy } from "@std/testing/mock";
import * as schema from "./financial-account.schema.ts";
import { FinancialAccountService } from "./financial-account.ts";

describe("FinancialAccountService", () => {
  let mockRepo: FinancialAccountRepository;
  let getByIdAsyncSpy: Spy;
  let saveAsyncSpy: Spy;
  let getAllAsyncSpy: Spy;
  let deleteByIdsAsyncSpy: Spy;
  let service: FinancialAccountService;

  function createMockRepo() {
    getByIdAsyncSpy = spy(
      (_id: string): Promise<FinancialAccount | null> => Promise.resolve(null),
    );
    saveAsyncSpy = spy(
      (..._entities: FinancialAccount[]): Promise<number> => Promise.resolve(1),
    );
    getAllAsyncSpy = spy(
      (): Promise<FinancialAccount[]> => Promise.resolve([]),
    );
    const getByIdsAsyncSpy = spy(
      (): Promise<FinancialAccount[]> => Promise.resolve([]),
    );
    deleteByIdsAsyncSpy = spy(
      (_ids: string[]): Promise<number> => Promise.resolve(0),
    );

    mockRepo = {
      getByIdAsync: getByIdAsyncSpy,
      saveAsync: saveAsyncSpy,
      getAllAsync: getAllAsyncSpy,
      getByIdsAsync: getByIdsAsyncSpy,
      deleteByIdsAsync: deleteByIdsAsyncSpy,
    } as FinancialAccountRepository;

    service = new FinancialAccountService(mockRepo);
  }

  beforeEach(() => {
    createMockRepo();
  });

  describe("upsertFinancialAccount(dto)", () => {
    describe("when account data is provided with an ID", () => {
      it("should upsert the account with the provided ID", async () => {
        const accountId = crypto.randomUUID();
        const accountData = schema.UpsertFinancialAccount.parse({
          id: accountId,
          name: "Investment",
          type: "Liability",
        });

        await service.upsertFinancialAccount(accountData);

        assertSpyCalls(getByIdAsyncSpy, 0);
        assertSpyCalls(saveAsyncSpy, 1);
        assertSpyCall(saveAsyncSpy, 0, {
          args: [{
            id: accountId,
            name: accountData.name,
            type: "Liability",
          }],
        });
      });
    });

    describe("when no id was provided", () => {
      it("should create a new account with a generated ID", async () => {
        const accountData = schema.UpsertFinancialAccount.parse({
          name: "Investment",
          type: "Liability",
        });

        await service.upsertFinancialAccount(accountData);

        assertSpyCalls(getByIdAsyncSpy, 0);
        assertSpyCalls(saveAsyncSpy, 1);
        const actualSaveArg: FinancialAccount = saveAsyncSpy.calls[0].args[0];
        assertEquals(actualSaveArg.name, accountData.name);
        assertEquals(actualSaveArg.type, "Liability");
        assertEquals(typeof actualSaveArg.id, "string");
      });
    });
  });

  describe("getAllFinancialAccounts()", () => {
    it("should call getAllAsync()", async () => {
      getAllAsyncSpy = spy(
        () => Promise.resolve([]),
      );
      mockRepo.getAllAsync = getAllAsyncSpy;

      const expected: schema.FinancialAccount[] = [];
      const actual = await service.getAllFinancialAccounts();

      assertSpyCalls(getAllAsyncSpy, 1);
      assertArrayIncludes(actual, expected);
    });

    it("should parse each returned record from repository", async () => {
      const records: FinancialAccount[] = [{
        id: crypto.randomUUID(),
        name: "Checking",
        type: "Asset",
      }];

      getAllAsyncSpy = spy(
        () => Promise.resolve(records),
      );
      mockRepo.getAllAsync = getAllAsyncSpy;
      const schemaParseSpy = spy(schema.FinancialAccount, "parse");

      const actual = await service.getAllFinancialAccounts();

      assertSpyCalls(getAllAsyncSpy, 1);
      assertSpyCalls(schemaParseSpy, 1);
      assertSpyCall(schemaParseSpy, 0, { args: [records[0]] });

      const expected = records.map((rec) => schema.FinancialAccount.parse(rec));
      assertArrayIncludes(actual, expected);
    });
  });

  describe("deleteFinancialAccountsByIds(ids)", () => {
    it("should invoke repository", async () => {
      deleteByIdsAsyncSpy = spy(
        (_ids) => Promise.resolve(0),
      );
      mockRepo.deleteByIdsAsync = deleteByIdsAsyncSpy;

      await service.deleteFinancialAccountsByIds([]);

      assertSpyCalls(deleteByIdsAsyncSpy, 1);
      assertSpyCall(deleteByIdsAsyncSpy, 0, {
        args: [[]],
      });
    });
  });
});
