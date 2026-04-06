import { FinancialAccountDao } from "@src/dao";
import * as db from "@src/db";
import * as model from "@src/model";
import { assertExists } from "@std/assert/exists";
import { beforeEach, describe, it } from "@std/testing/bdd";
import {
  assertSpyCall,
  assertSpyCalls,
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
        assertExists(stubs.connectionBuilder.get);
        assertSpyCalls(stubs.connectionBuilder.get, 1);

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
                type: schema.FinancialAccountTypeCode.parse(
                  updatedAccountData.type,
                ),
              },
              updatedAccountData.id!,
            ),
          ],
          returned: 1,
        });
      });
    });
  });
});
