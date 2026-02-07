import { IEqual, ifNaNThen } from "./common.ts";

export type ChronoUnit =
  | "Year"
  | "Month"
  | "Day"
  | "Hour"
  | "Minute"
  | "Second"
  | "Milliseconds";

export enum ChronoFormat {
  Basic,
  Iso8061,
}

export class Chrono implements IEqual<Chrono> {
  private date: Date;

  constructor(date?: Date) {
    this.date = date ?? new Date();
  }

  static from(
    date: Chrono | Date | string | number | bigint | Uint8Array | null,
  ): Chrono {
    if (typeof date === "string") {
      return Chrono.fromMillis(Date.parse(date));
    }

    if (
      typeof date === "number"
      || typeof date === "bigint"
      || date instanceof Uint8Array
    ) {
      return Chrono.fromUnix(Number(date));
    }

    if (date instanceof Chrono) {
      return Chrono.fromMillis(date.millis());
    }

    if (date === null) {
      return Chrono.now();
    }

    return new Chrono(date);
  }

  static now() {
    return Chrono.from(new Date());
  }

  static fromUnix(seconds: number) {
    return new Chrono(new Date(seconds * 1000));
  }

  static fromMillis(ms: number) {
    return new Chrono(new Date(ms));
  }

  year() {
    return this.date.getFullYear();
  }

  month() {
    return this.date.getMonth();
  }

  day() {
    return this.date.getDate();
  }

  hours() {
    return this.date.getHours();
  }

  minutes() {
    return this.date.getMinutes();
  }

  seconds() {
    return this.date.getSeconds();
  }

  milliseconds() {
    return this.date.getMilliseconds();
  }

  unix(): number {
    return Math.floor(this.date.getTime() / 1000);
  }

  millis(): number {
    return this.date.getTime();
  }

  diff(other: Chrono): ChronoSpan {
    return ChronoSpan.fromMilliseconds(this.millis() - other.millis());
  }

  startOf(p: ChronoUnit) {
    if (p === "Year") {
      return new Chrono(new Date(this.year(), 0, 1, 0, 0, 0, 0));
    }

    if (p === "Month") {
      return new Chrono(new Date(this.year(), this.month(), 1, 0, 0, 0, 0));
    }

    if (p === "Day") {
      return new Chrono(
        new Date(this.year(), this.month(), this.day(), 0, 0, 0, 0),
      );
    }

    throw new Error(`Unsupported Chrono unit: ${p}`);
  }

  add(span: ChronoSpan): Chrono {
    return Chrono.fromMillis(this.millis() + span.milliseconds);
  }

  subtract(span: ChronoSpan): Chrono {
    return Chrono.fromMillis(this.millis() - span.milliseconds);
  }

  next(unit: ChronoUnit): Chrono {
    if (unit === "Year" || unit === "Month") {
      const newDate = new Date(
        unit === "Year" ? this.year() + 1 : this.year(),
        unit === "Month" ? this.month() + 1 : this.month(),
        this.day(),
        this.hours(),
        this.seconds(),
        this.milliseconds(),
      );

      const next = Chrono.from(newDate);
      return next;
    }

    let span: ChronoSpan;
    switch (unit) {
      case "Day":
        span = ChronoSpan.fromDays(1);
        break;
      case "Hour":
        span = ChronoSpan.fromHours(1);
        break;
      case "Minute":
        span = ChronoSpan.fromMinutes(1);
        break;
      case "Second":
        span = ChronoSpan.fromSeconds(1);
        break;
      default:
        throw new Error(`Unsupported unit: {unit}`);
    }
    return this.add(span);
  }

  equal(that: Chrono) {
    return this.millis() === that.millis();
  }

  before(that: Chrono) {
    return this.millis() < that.millis();
  }

  beforeOrEqual(that: Chrono) {
    return this.before(that) || this.equal(that);
  }

  after(that: Chrono) {
    return this.millis() > that.millis();
  }

  afterOrEqual(that: Chrono) {
    return this.after(that) || this.equal(that);
  }

  toString(format: ChronoFormat = ChronoFormat.Iso8061) {
    const year = this.date.getFullYear();
    const month = this.date.getMonth() + 1;
    const day = this.date.getDate();
    const hours = this.date.getHours();
    const minutes = this.date.getMinutes();
    const seconds = this.date.getSeconds();
    const milliSeconds = this.date.getMilliseconds();
    const timeZone = ChronoSpan.fromMinutes(-this.date.getTimezoneOffset());

    const yearStr = year.toString().padStart(2, "0");
    const monthStr = month.toString().padStart(2, "0");
    const dayStr = day.toString().padStart(2, "0");
    const hoursStr = hours.toString().padStart(2, "0");
    const minutesStr = minutes.toString().padStart(2, "0");
    const secondsStr = seconds.toString().padStart(2, "0");
    const milliSecondsStr = milliSeconds.toString().padStart(3, "0");
    const timeZoneStr = timeZone.toString(ChronoSpanFormat.TimeZone);

    if (format == ChronoFormat.Iso8061) {
      return `${yearStr}-${monthStr}-${dayStr}T${hoursStr}:${minutesStr}:${secondsStr}.${milliSecondsStr}${timeZoneStr}`;
    }

    return this.date.toString();
  }
}

export enum ChronoSpanFormat {
  Basic,
  TimeZone,
}

export class ChronoSpan {
  isNegative: boolean = true;
  days!: number;
  hours!: number;
  minutes!: number;
  seconds!: number;
  milliseconds!: number;

  private constructor() {}

  static fromMilliseconds(ms: number) {
    const abs = Math.abs(ms);
    const timespan = new ChronoSpan();

    timespan.isNegative = ms < 0;
    timespan.milliseconds = abs;
    timespan.seconds = abs / 1000;
    timespan.minutes = abs / 1000 / 60;
    timespan.hours = abs / 1000 / 60 / 60;
    timespan.days = abs / 1000 / 60 / 60 / 24;

    return timespan;
  }

  static fromSeconds(seconds: number) {
    return ChronoSpan.fromMilliseconds(seconds * 1000);
  }

  static fromMinutes(minutes: number) {
    return ChronoSpan.fromMilliseconds(minutes * 60 * 1000);
  }

  static fromHours(hours: number) {
    return ChronoSpan.fromMilliseconds(hours * 60 * 60 * 1000);
  }

  static fromDays(days: number) {
    return ChronoSpan.fromMilliseconds(days * 24 * 60 * 60 * 1000);
  }

  toString(format: ChronoSpanFormat) {
    const days = Math.floor(this.days);
    const hours = ifNaNThen(this.hours % (days * 24), Math.floor(this.hours));
    const minutes = ifNaNThen(
      this.minutes % ((days * 24 * 60) + (hours * 60)),
      Math.floor(this.minutes),
    );
    const seconds = ifNaNThen(
      this.seconds
        % (((days * 24 + hours) * 60 + minutes) * 60),
      Math.floor(this.seconds),
    );
    const milliseconds = ifNaNThen(
      this.milliseconds
        % ((((days * 24 + hours) * 60 + minutes) * 60 + seconds) * 1000),
      Math.floor(this.milliseconds),
    );

    const daysStr = days.toString();
    const hoursStr = hours.toString().padStart(2, "0");
    const minutesStr = minutes.toString().padStart(2, "0");
    const secondsStr = seconds.toString().padStart(2, "0");
    const milliSecondsStr = milliseconds.toString().padStart(3, "0");

    if (format === ChronoSpanFormat.TimeZone) {
      return `${this.isNegative ? "-" : "+"}${hoursStr}${minutesStr}`;
    }

    return `${daysStr}.${hoursStr}:${minutesStr}:${secondsStr}.${milliSecondsStr}`;
  }
}
