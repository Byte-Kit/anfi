import { describe, it } from "@std/testing/bdd";
import { collect, Collection } from "./collection.ts";
import { assertArrayIncludes, assertEquals } from "@std/assert";

describe("Collection", () => {
  describe("isEmpty", () => {
    it("should evaluate whether the collection is empty", () => {
      assertEquals(true, collect([]).isEmpty());
      assertEquals(false, collect([1, 2]).isEmpty());
    });
  });

  describe("groupBy((item: T) => string | number)", () => {
    it("should return a new collection with the original items grouped by the selected key", () => {
      const people = [
        { name: "Isaac", age: 26 },
        { name: "Ari", age: 26 },
        { name: "Byte", age: 20 },
      ];

      const peopleGroupedByAge = Collection.from(people).groupBy((person) =>
        person.age
      ).toArray();
      assertEquals(
        peopleGroupedByAge,
        [
          [{ name: "Isaac", age: 26 }, { name: "Ari", age: 26 }],
          [{ name: "Byte", age: 20 }],
        ],
      );
    });
  });

  describe("first()", () => {
    it("should the first item in the collection", () => {
      assertEquals(collect([1]).first(), 1);
    });
  });

  describe("withoutFirst()", () => {
    it("should return a copy without the first item", () => {
      assertArrayIncludes(collect([1, 2, 3]).withoutFirst().toArray(), [2, 3]);
    });
  });

  describe("withoutLast()", () => {
    it("should return a copy without the last item", () => {
      assertArrayIncludes(collect([1, 2, 3]).withoutLast().toArray(), [1, 2]);
    });
  });

  describe("join()", () => {
    it("should return a string formed by joining all items", () => {
      assertEquals(collect([1, 2]).join(), "1,2");
      assertEquals(collect([1, 2]).join("-"), "1-2");
    });
  });
});
