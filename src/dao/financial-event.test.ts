import * as db from "@anfi/db";
import { FinancialEvent } from "@anfi/model";
import { assertArrayIncludes, assertEquals, assertExists } from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { FinancialEventDao } from "./financial-event.ts";

describe("FinancialEventDao", () => {
  let dao!: FinancialEventDao;

  function makeEvent(
    overrides: Partial<{ timestamp: number; description: string }> = {},
  ): FinancialEvent {
    return new FinancialEvent({
      timestamp: overrides.timestamp ?? 1000000,
      description: overrides.description ?? "Event",
    });
  }

  beforeEach(async () => {
    await db.cleanUpAsync();
    await db.migrateAsync();
    dao = new FinancialEventDao(new db.ConnectionBuilder().get());
  });

  describe("save(...entities)", () => {
    describe("when saving non-existent records", () => {
      it("should insert new records", () => {
        const insertedCount = dao.save(
          makeEvent({ description: "Event A" }),
          makeEvent({ description: "Event B" }),
        );
        assertEquals(insertedCount, 2);
      });
    });

    describe("when saving an existing record", () => {
      it("should update the record", () => {
        const original = makeEvent({ description: "Original" });
        dao.save(original);

        const updated = new FinancialEvent(
          { timestamp: 2000000, description: "Updated" },
          original.id,
        );
        dao.save(updated);

        const actual = dao.getById(original.id);
        assertExists(actual);
        assertEquals(actual.timestamp, 2000000);
        assertEquals(actual.description, "Updated");
      });
    });
  });

  describe("getById(id)", () => {
    describe("when a record with the specified ID exists", () => {
      it("should return the found record", () => {
        const event = makeEvent({
          timestamp: 3000000,
          description: "My Event",
        });
        dao.save(event);

        const actual = dao.getById(event.id);
        assertExists(actual);
        assertEquals(actual.id, event.id);
        assertEquals(actual.timestamp, event.timestamp);
        assertEquals(actual.description, event.description);
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
      const events = [
        makeEvent({ description: "Event A" }),
        makeEvent({ description: "Event B" }),
      ];

      dao.save(...events);
      assertArrayIncludes(dao.getAll(), events);
    });
  });

  describe("deleteByIds(ids)", () => {
    describe("when no ids are provided", () => {
      it("should make no change", () => {
        dao.save(makeEvent());
        assertEquals(dao.deleteByIds([]), 0);
      });
    });

    describe("when non-empty ids are provided", () => {
      it("should delete records with the specified IDs", () => {
        const events = [
          makeEvent(),
          makeEvent(),
        ];
        dao.save(...events);

        const deletedCount = dao.deleteByIds(events.map((e) => e.id));
        assertEquals(deletedCount, events.length);
        assertEquals(dao.getAll(), []);
      });
    });
  });
});
