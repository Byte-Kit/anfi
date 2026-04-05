import * as db from "@src/db";
import * as model from "@src/model";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertSpyCallArgs, assertSpyCalls, stub } from "@std/testing/mock";
import { FinancialAccountDao } from "../dao/financial-account.ts";
import { upsertFinancialAccount } from "./financial-account.ts";

describe("financial-account", () => {
  beforeEach(async () => {
    await db.removeAsync();
    await db.migrateAsync();
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
          type: existingAccount.type,
        };

        const daoStubs = {
          getById: stub(
            FinancialAccountDao.prototype,
            "getById",
            (_id: string) => existingAccount,
          ),
          save: stub(
            FinancialAccountDao.prototype,
            "save",
            (_entity: model.FinancialAccount) => 1,
          ),
        };

        // Act
        upsertFinancialAccount(updatedAccountData);

        // Assert
        assertSpyCalls(daoStubs.getById, 1);
        assertSpyCallArgs(daoStubs.getById, 0, [existingAccount.id]);
        assertSpyCalls(daoStubs.save, 1);
        assertSpyCallArgs(daoStubs.save, 0, [
          new model.FinancialAccount(
            { ...updatedAccountData },
            updatedAccountData.id,
          ),
        ]);
      });
    });
  });
});
