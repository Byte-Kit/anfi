export class StringBuilder {
  private _result: string = "";

  get() {
    return this._result;
  }

  /**
   * Alias to {@link append}
   */
  a = this.append;

  /**
   * Alias to {@link newLine}
   */
  n = this.newLine;

  /**
   * Alias to {@link space}
   */
  s = this.space;

  append(...values: string[]) {
    this._result = this._result.concat(values.join(""));
    return this;
  }

  space(count: number = 1): StringBuilder {
    if (count === 0) {
      return this;
    }

    return this.append(" ").space(count - 1);
  }

  newLine() {
    return this.append("\n");
  }

  /**
   * Alias to {@link word}
   */
  w = this.word;

  word(...values: string[]): StringBuilder {
    if (values.length === 0) {
      return this;
    }

    return this.append(values.join(" ")).append(" ");
  }

  line(...values: string[]) {
    if (values.length === 0) {
      return this;
    }

    return this.append(values.join("\n")).newLine();
  }
}
