import { equal } from "@std/assert";

export class StringAssertion {
  private _value: unknown;

  constructor(value: unknown) {
    this._value = value;
  }

  equals(expected: string) {
    return this.isString() && equal(String(this._value), expected);
  }

  notBlank() {
    return this.isString() && String(this._value).trim().length > 0;
  }

  private isString() {
    return typeof this._value === "string";
  }
}

export class BooleanAssertion {
  private _value: unknown;

  constructor(value: unknown) {
    this._value = value;
  }

  equals(expected: boolean) {
    return this.isBoolean() && equal(Boolean(this._value), expected);
  }

  private isBoolean() {
    return typeof this._value === "boolean";
  }
}

export const assert = {
  string(value: unknown) {
    return new StringAssertion(value);
  },

  boolean(value: unknown) {
    return new BooleanAssertion(value);
  },
};
