import { FinancialAccountDao } from "@src/dao";
import * as db from "@src/db";
import * as model from "@src/model";
import { assertArrayIncludes, assertEquals } from "@std/assert";
import { assertExists } from "@std/assert/exists";
import { beforeEach, describe, it } from "@std/testing/bdd";
import {
  assertSpyCall,
  assertSpyCalls,
  spy,
  SpyLike,
  stub,
} from "@std/testing/mock";
import * as schema from "./financial-account.schema.ts";
import { FinancialAccountService } from "./financial-account.ts";

type Stubs = {
  connectionBuilder: {
    get?: SpyLike;
  };
  financialAccountDao: {
    getById?: SpyLike;
    save?: SpyLike;
    getAll?: SpyLike;
    deleteByIds?: SpyLike;
  };
};

describe("financial-account", () => {
  const stubs: Stubs = {
    connectionBuilder: {},
    financialAccountDao: {},
  };
  let financialAccountService: FinancialAccountService;

  beforeEach(() => {
    stubs.connectionBuilder.get?.restore();
    stubs.connectionBuilder.get = stub(
      db.ConnectionBuilder.prototype,
      "get",
      () => ({} as db.DbConnection),
    );

    financialAccountService = new FinancialAccountService();
  });

  describe("upsertFinancialAccount(dto)", () => {
    describe("when an existing account is found", () => {
      it("should update the account", () => {
        // Arrange
        const existingAccount = new model.FinancialAccount(
          {
            name: "Checking",
            type: model.FinancialAccountType.Asset,
          },
          crypto.randomUUID(),
        );
        const updatedAccountData = {
          id: existingAccount.id,
          name: "Investment",
          type: "Liability",
        };

        stubs.financialAccountDao.getById?.restore();
        stubs.financialAccountDao.getById = stub(
          FinancialAccountDao.prototype,
          "getById",
          (_id: string) => existingAccount,
        );

        stubs.financialAccountDao.save?.restore();
        stubs.financialAccountDao.save = stub(
          FinancialAccountDao.prototype,
          "save",
          (_entity: model.FinancialAccount) => 1,
        );

        // Act
        financialAccountService.upsertFinancialAccount(updatedAccountData);

        // Assert
        assertSpyCalls(stubs.financialAccountDao.getById, 1);
        assertSpyCall(stubs.financialAccountDao.getById, 0, {
          args: [existingAccount.id],
          returned: existingAccount,
        });

        assertSpyCalls(stubs.financialAccountDao.save, 1);
        assertSpyCall(stubs.financialAccountDao.save, 0, {
          args: [
            new model.FinancialAccount(
              {
                name: updatedAccountData.name,
                type: model.FinancialAccountType.Liability,
              },
              updatedAccountData.id!,
            ),
          ],
          returned: 1,
        });
      });
    });

    describe("when no existing account exists", () => {
      it("should create a new account", () => {
        // Arrange
        const accountData = {
          id: crypto.randomUUID(),
          name: "Investment",
          type: "Liability",
        };

        stubs.financialAccountDao.getById?.restore();
        stubs.financialAccountDao.getById = stub(
          FinancialAccountDao.prototype,
          "getById",
          (_id: string) => null,
        );

        stubs.financialAccountDao.save?.restore();
        stubs.financialAccountDao.save = stub(
          FinancialAccountDao.prototype,
          "save",
          (_entity: model.FinancialAccount) => 1,
        );

        // Act
        financialAccountService.upsertFinancialAccount(accountData);

        // Assert
        assertSpyCalls(stubs.financialAccountDao.getById, 1);
        assertSpyCall(stubs.financialAccountDao.getById, 0, {
          args: [accountData.id],
          returned: null,
        });

        assertSpyCalls(stubs.financialAccountDao.save, 1);
        assertSpyCall(stubs.financialAccountDao.save, 0, {
          args: [
            new model.FinancialAccount(
              {
                name: accountData.name,
                type: model.FinancialAccountType.Liability,
              },
              accountData.id,
            ),
          ],
          returned: 1,
        });
      });
    });

    describe("when no id was provided", () => {
      it("should create a new account", () => {
        // Arrange
        const accountData = {
          id: null,
          name: "Investment",
          type: "Liability",
        };

        stubs.financialAccountDao.getById?.restore();
        stubs.financialAccountDao.getById = stub(
          FinancialAccountDao.prototype,
          "getById",
          (_id: string) => null,
        );

        stubs.financialAccountDao.save?.restore();
        stubs.financialAccountDao.save = stub(
          FinancialAccountDao.prototype,
          "save",
          (_entity: model.FinancialAccount) => 1,
        );

        // Act
        financialAccountService.upsertFinancialAccount(accountData);

        // Assert
        assertSpyCalls(stubs.financialAccountDao.getById, 0);
        assertSpyCalls(stubs.financialAccountDao.save, 1);
        const actualSaveArg: model.FinancialAccount =
          stubs.financialAccountDao.save.calls[0].args[0];
        assertEquals(actualSaveArg.name, accountData.name);
        assertEquals(actualSaveArg.type, model.FinancialAccountType.Liability);
      });
    });
  });

  describe("listFinancialAccounts()", () => {
    it("should call FinancialAccountDao.getAll()", () => {
      stubs.financialAccountDao.getAll?.restore();
      stubs.financialAccountDao.getAll = stub(
        FinancialAccountDao.prototype,
        "getAll",
        () => [],
      );

      const expected: schema.FinancialAccount[] = [];
      const actual = financialAccountService.listFinancialAccounts();

      assertExists(stubs.financialAccountDao.getAll);
      assertSpyCalls(stubs.financialAccountDao.getAll, 1);
      assertArrayIncludes(actual, expected);
    });

    it("should parse each returned record from DAO", () => {
      // Arrange
      const records = [
        new model.FinancialAccount({
          name: "Checking",
          type: model.FinancialAccountType.Asset,
        }, crypto.randomUUID()),
      ];

      stubs.financialAccountDao.getAll?.restore();
      stubs.financialAccountDao.getAll = stub(
        FinancialAccountDao.prototype,
        "getAll",
        () => records,
      );
      const schemaParseSpy = spy(schema.FinancialAccount, "parse");

      // Act
      const actual = financialAccountService.listFinancialAccounts();

      // Assert
      assertExists(stubs.financialAccountDao.getAll);
      assertSpyCalls(stubs.financialAccountDao.getAll, 1);
      assertSpyCalls(schemaParseSpy, 1);
      assertSpyCall(schemaParseSpy, 0, { args: [records[0]] });

      const expected = records.map((rec) => schema.FinancialAccount.parse(rec));
      assertArrayIncludes(actual, expected);
    });
  });

  describe("deleteFinancialAccountByIds(ids)", () => {
    it("should invoke DAO", () => {
      stubs.financialAccountDao.deleteByIds?.restore();
      stubs.financialAccountDao.deleteByIds = stub(
        FinancialAccountDao.prototype,
        "deleteByIds",
        (_ids) => 0,
      );

      financialAccountService.deleteFinancialAccountByIds([]);

      assertExists(stubs.financialAccountDao.deleteByIds);
      assertSpyCalls(stubs.financialAccountDao.deleteByIds, 1);
      assertSpyCall(stubs.financialAccountDao.deleteByIds, 0, {
        args: [[]],
      });
    });
  });
});
