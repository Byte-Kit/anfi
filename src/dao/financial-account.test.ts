import { beforeEach, describe, it } from "@std/testing/bdd";
import * as db from "@src/db/index.ts";
import { FinancialAccountDao } from "./financial-account.ts";
import { FinancialAccount, FinancialAccountType } from "../model/index.ts";
import { assertEquals, assertExists } from "@std/assert";

describe("FinancialAccountDao", () => {
  let dao!: FinancialAccountDao;

  beforeEach(async () => {
    await db.removeAsync();
    await db.migrateAsync();
    dao = new FinancialAccountDao(db.connect());
  });

  describe("save(TEntity)", () => {
    describe("when saving a non-existent record", () => {
      it("should insert a new record", () => {
        const insertedRecordCount = dao.save(
          new FinancialAccount({
            type: FinancialAccountType.Asset,
            name: "Checking Account",
          }),
        );
        assertEquals(insertedRecordCount, 1);
      });
    });

    describe("when saving an existing record", () => {
      it("should update the record", () => {
        const originalRecord = new FinancialAccount({
          type: FinancialAccountType.Asset,
          name: "Checking Account 1",
        });
        dao.save(originalRecord);

        const updatedRecord = new FinancialAccount({
          ...originalRecord,
          name: "Checking Account 2",
        }, originalRecord.id);
        dao.save(updatedRecord);

        const actual = db.connect()
          .prepare(`SELECT * FROM ${dao.Table} WHERE id = ?`)
          .get(updatedRecord.id);

        assertExists(actual);
        assertEquals(actual["name"], updatedRecord.name);
      });
    });
  });

  describe("getById(string)", () => {
    describe("when a record with the specified ID exists", () => {
      it("should return the found record", () => {
        const record = new FinancialAccount({
          type: FinancialAccountType.Asset,
          name: "Checking Account",
        });
        dao.save(record);
        const actual = dao.getById(record.id);
        assertExists(actual);
        assertEquals(actual.id, record.id);
        assertEquals(actual.type, record.type);
        assertEquals(actual.name, record.name);
      });
    });

    describe("when no record can be found", () => {
      it("should return null", () => {
        assertEquals(dao.getById(crypto.randomUUID()), null);
      });
    });
  });
});
