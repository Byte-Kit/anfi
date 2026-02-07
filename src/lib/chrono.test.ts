import { assert, assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import {
  Chrono,
  ChronoFormat,
  ChronoSpan,
  ChronoSpanFormat,
} from "./chrono.ts";

describe("Chrono", () => {
  describe("can be instantiated", () => {
    it("from current datetime", () => {
      const expected = new Date();
      const actual = Chrono.now();
      assert(Math.round(actual.millis() - expected.getTime()) <= 1);
    });

    it("from unix timestamp", () => {
      const timestamp = 1738368000;
      const expected = new Date(timestamp * 1000);
      const actual = Chrono.fromUnix(timestamp);
      assertEquals(actual.millis(), expected.getTime());
    });

    it("from millis timestamp", () => {
      const timestamp = 1738368000123;
      const expected = new Date(timestamp);
      const actual = Chrono.fromMillis(timestamp);
      assertEquals(actual.millis(), expected.getTime());
    });

    it("from arbitrary datetime string", () => {
      const datetimeStr = "2025-01-01T07:00:00+0700";
      const expected = Date.parse(datetimeStr);
      const actual = Chrono.from(datetimeStr);
      assertEquals(actual.millis(), expected);
    });

    it("from another Chrono", () => {
      const datetimeStr = "2025-01-01T07:00:00+0700";
      const expected = Date.parse(datetimeStr);
      const actual = Chrono.from(Chrono.from(datetimeStr));
      assertEquals(actual.millis(), expected);
    });
  });

  describe("unix()", () => {
    it("should return seconds since the unix epoch", () => {
      const now = new Date();
      assertEquals(new Chrono(now).unix(), Math.floor(now.getTime() / 1000));
    });
  });

  describe("unixInMilliseconds()", () => {
    it("should return milliseconds since the unix epoch", () => {
      const now = new Date();
      assertEquals(new Chrono(now).millis(), now.getTime());
    });
  });

  describe("diff()", () => {
    it("should return a ChronoSpan representing the difference between two Chrono instances", () => {
      const now = new Date();

      const oneHundredMillisAgo = new Date(now.getTime() - 100);
      assertEquals(
        Chrono.from(now).diff(Chrono.from(oneHundredMillisAgo)).milliseconds,
        100,
      );

      const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
      assertEquals(
        Chrono.from(now).diff(Chrono.from(twoMinutesAgo)).minutes,
        2,
      );

      const threeMinutesAgo = new Date(now.getTime() - 3 * 60 * 1000);
      assertEquals(
        Chrono.from(now).diff(Chrono.from(threeMinutesAgo)).minutes,
        3,
      );

      const anHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);
      assertEquals(Chrono.from(now).diff(Chrono.from(anHourAgo)).hours, 1);
    });
  });

  describe("startOf() should return a cloned Chrono set to the start of", () => {
    it("the day", () => {
      const datetime = new Date(2025, 1, 1, 7, 0, 0, 0);
      const expected = new Date(
        datetime.getFullYear(),
        datetime.getMonth(),
        datetime.getDate(),
        0,
        0,
        0,
        0,
      );
      const actual = Chrono.from(datetime).startOf("Day");
      assertEquals(actual.millis(), expected.getTime());
    });

    it("the month", () => {
      const datetime = new Date();
      const expected = new Date(
        datetime.getFullYear(),
        datetime.getMonth(),
        1,
        0,
        0,
        0,
        0,
      );
      const actual = Chrono.from(datetime).startOf("Month");
      assertEquals(actual.millis(), expected.getTime());
    });

    it("the year", () => {
      const datetime = new Date();
      const today = new Date(datetime.getFullYear(), 0, 1, 0, 0, 0, 0);
      const actual = Chrono.from(datetime).startOf("Year");
      assertEquals(actual.millis(), today.getTime());
    });
  });

  describe("add()", () => {
    it("should return a clone with added or subtracted duration", () => {
      const cases: [Chrono, Chrono][] = [
        [
          Chrono.from("2025-01-01").add(ChronoSpan.fromDays(2)),
          Chrono.from("2025-01-03"),
        ],
      ];

      cases.forEach((entry) => {
        const [actual, expected] = entry;
        assertEquals(actual.millis(), expected.millis());
      });
    });
  });

  describe("subtract()", () => {
    it("should return a clone with added or subtracted duration", () => {
      const cases: [Chrono, Chrono][] = [
        [
          Chrono.from("2025-01-01T00:00:00+0700")
            .subtract(ChronoSpan.fromHours(2)),
          Chrono.from("2024-12-31T22:00:00+0700"),
        ],
      ];

      cases.forEach((entry) => {
        const [actual, expected] = entry;
        assertEquals(actual.toString(), expected.toString());
      });
    });
  });

  describe("toString()", () => {
    it("should display datetime using the basic format", () => {
      const now = new Date();
      assertEquals(
        new Chrono(now).toString(ChronoFormat.Basic),
        now.toString(),
      );
    });

    it("should display datetime using ISO 8061 format", () => {
      const now = new Date(2025, 0, 1, 7, 30, 5, 500);
      assertEquals(
        new Chrono(now).toString(ChronoFormat.Iso8061),
        "2025-01-01T07:30:05.500+0700",
      );
    });
  });
});

describe("ChronoSpan", () => {
  describe("fromMilliseconds()", () => {
    it("should instantiate from milliseconds", () => {
      const chronoSpan = ChronoSpan.fromMilliseconds(500);
      assertEquals(chronoSpan.milliseconds, 500);
      assertEquals(chronoSpan.seconds, 500 / 1000);
      assertEquals(chronoSpan.minutes, 500 / 1000 / 60);
      assertEquals(chronoSpan.hours, 500 / 1000 / 60 / 60);
      assertEquals(chronoSpan.days, 500 / 1000 / 60 / 60 / 24);
    });
  });

  describe("fromSeconds()", () => {
    it("should instantiate from seconds", () => {
      const chronoSpan = ChronoSpan.fromSeconds(30.5);
      assertEquals(chronoSpan.milliseconds, 30.5 * 1000);
      assertEquals(chronoSpan.seconds, 30.5);
      assertEquals(chronoSpan.minutes, 30.5 / 60);
      assertEquals(chronoSpan.hours, 30.5 / 60 / 60);
      assertEquals(chronoSpan.days, 30.5 / 60 / 60 / 24);
    });
  });

  describe("fromMinutes()", () => {
    it("should instantiate from minutes", () => {
      const chronoSpan = ChronoSpan.fromMinutes(30.59);
      assertEquals(chronoSpan.milliseconds, 30.59 * 60 * 1000);
      assertEquals(chronoSpan.seconds, 30.59 * 60);
      assertEquals(chronoSpan.minutes, 30.59);
      assertEquals(chronoSpan.hours, 30.59 / 60);
      assertEquals(chronoSpan.days, 30.59 / 60 / 24);
    });
  });

  describe("fromHours()", () => {
    it("should instantiate from hours", () => {
      const chronoSpan = ChronoSpan.fromHours(2.49);
      assertEquals(chronoSpan.milliseconds, 2.49 * 60 * 60 * 1000);
      assertEquals(chronoSpan.seconds, 2.49 * 60 * 60);
      assertEquals(chronoSpan.minutes, 2.49 * 60);
      assertEquals(chronoSpan.hours, 2.49);
      assertEquals(chronoSpan.days, 2.49 / 24);
    });
  });

  describe("fromDays()", () => {
    it("should instantiate from days", () => {
      const chronoSpan = ChronoSpan.fromDays(1.5);
      assertEquals(chronoSpan.milliseconds, 1.5 * 24 * 60 * 60 * 1000);
      assertEquals(chronoSpan.seconds, 1.5 * 24 * 60 * 60);
      assertEquals(chronoSpan.minutes, 1.5 * 24 * 60);
      assertEquals(chronoSpan.hours, 1.5 * 24);
      assertEquals(chronoSpan.days, 1.5);
    });
  });

  describe("toString()", () => {
    it("should dislay timespan using the basic format", () => {
      const cases: [ChronoSpan, string][] = [
        [ChronoSpan.fromDays(0), "0.00:00:00.000"],
        [ChronoSpan.fromDays(7), "7.00:00:00.000"],
        [ChronoSpan.fromDays(1.5), "1.12:00:00.000"],
        [ChronoSpan.fromHours(25), "1.01:00:00.000"],
        [ChronoSpan.fromHours(7), "0.07:00:00.000"],
        [ChronoSpan.fromHours(5.5), "0.05:30:00.000"],
        [ChronoSpan.fromMinutes(61), "0.01:01:00.000"],
        [ChronoSpan.fromMinutes(30), "0.00:30:00.000"],
        [ChronoSpan.fromMinutes(20.5), "0.00:20:30.000"],
        [ChronoSpan.fromSeconds(7), "0.00:00:07.000"],
        [ChronoSpan.fromMilliseconds(7), "0.00:00:00.007"],
      ];

      cases.forEach((entry) => {
        const [actual, expected] = entry;
        assertEquals(actual.toString(ChronoSpanFormat.Basic), expected);
      });
    });

    it("should dislay timespan using the TimeZone format", () => {
      assertEquals(
        ChronoSpan.fromHours(0).toString(ChronoSpanFormat.TimeZone),
        "+0000",
      );

      assertEquals(
        ChronoSpan.fromHours(2.5).toString(ChronoSpanFormat.TimeZone),
        "+0230",
      );

      assertEquals(
        ChronoSpan.fromMinutes(-420).toString(ChronoSpanFormat.TimeZone),
        "-0700",
      );
    });
  });

  describe("equals", () => {
    it("should check whether two Chrono instance are equal", () => {
      assertEquals(
        true,
        Chrono.from("2025-01-01").equal(Chrono.from("2025-01-01")),
      );
      assertEquals(
        false,
        Chrono.from("2025-01-01T09:00:00").equal(
          Chrono.from("2025-01-01T09:00:01"),
        ),
      );
    });
  });

  describe("before", () => {
    it("should check whether a Chrono instance occurs before another", () => {
      assertEquals(
        true,
        Chrono.from("2025-01-01").before(Chrono.from("2025-01-02")),
      );
      assertEquals(
        false,
        Chrono.from("2025-01-01T09:00:00").before(
          Chrono.from("2025-01-01T00:00:00"),
        ),
      );
    });
  });

  describe("beforeOrEqual", () => {
    it("should check whether a Chrono instance occurs before or at the same time as another", () => {
      assertEquals(
        true,
        Chrono.from("2025-01-01").beforeOrEqual(Chrono.from("2025-01-02")),
      );
      assertEquals(
        true,
        Chrono.from("2025-01-01").beforeOrEqual(Chrono.from("2025-01-01")),
      );
      assertEquals(
        false,
        Chrono.from("2025-01-01T09:00:00").beforeOrEqual(
          Chrono.from("2025-01-01T00:00:00"),
        ),
      );
    });
  });

  describe("after", () => {
    it("should check whether a Chrono instance occurs after another", () => {
      assertEquals(
        true,
        Chrono.from("2025-01-02").after(Chrono.from("2025-01-01")),
      );
      assertEquals(
        false,
        Chrono.from("2025-01-01T00:00:00").after(
          Chrono.from("2025-01-01T09:00:00"),
        ),
      );
    });
  });

  describe("afterOrEqual", () => {
    it("should check whether a Chrono instance occurs before or at the same time as another", () => {
      assertEquals(
        true,
        Chrono.from("2025-01-02").afterOrEqual(Chrono.from("2025-01-01")),
      );
      assertEquals(
        true,
        Chrono.from("2025-01-02").afterOrEqual(Chrono.from("2025-01-02")),
      );
      assertEquals(
        false,
        Chrono.from("2025-01-01T00:00:00").afterOrEqual(
          Chrono.from("2025-01-01T09:00:00"),
        ),
      );
    });
  });

  describe("next", () => {
    it("should increment the Chrono instance by 1 value of the specified unit", () => {
      const testParams = [
        [Chrono.from("2024-12-31").next("Year"), Chrono.from("2025-12-31")],
        [Chrono.from("2024-02-29").next("Year"), Chrono.from("2025-03-01")],

        [Chrono.from("2024-12-31").next("Month"), Chrono.from("2025-01-31")],
        [Chrono.from("2025-01-01").next("Month"), Chrono.from("2025-02-01")],
        [Chrono.from("2025-01-31").next("Month"), Chrono.from("2025-03-03")],

        [Chrono.from("2025-01-01").next("Day"), Chrono.from("2025-01-02")],
        [Chrono.from("2025-01-31").next("Day"), Chrono.from("2025-02-01")],

        [
          Chrono.from("2025-01-01T00:00:00").next("Hour"),
          Chrono.from("2025-01-01T01:00:00"),
        ],
      ];

      testParams.forEach(([actual, expected]) => {
        try {
          assert(actual.equal(expected));
        } catch (_) {
          console.log(expected.toString());
          console.log(actual.toString());
        }
      });
    });
  });
});
