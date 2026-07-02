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

  /**
   * Alias to {@link line}
   */
  l = this.line;

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

  line(value: string) {
    return this.append(value).newLine();
  }

  lines(values: string[], sep: string = "") {
    return this.append(...values.join(`${sep}\n`)).newLine();
  }
}

export function camelToSnakeCase(value: string): string {
  return value.replace(/([A-Z])/g, "_$1").toLowerCase();
}

export function trim(strings: TemplateStringsArray, ...values: unknown[]) {
  const interpolatedStr = strings.reduce(
    (acc, str, i) => acc + str + (values[i] ?? ""),
    "",
  );
  if (!interpolatedStr.includes("\n")) {
    return interpolatedStr;
  }

  const lines = interpolatedStr.split("\n");
  const firstIndentedLine = lines.find((line) => line.startsWith(" "));
  const indent = firstIndentedLine
    ? firstIndentedLine.length - firstIndentedLine.trimStart().length
    : 0;

  const dedentedLines = lines.map((line) =>
    line.slice(Math.min(line.length - line.trimStart().length, indent))
  );
  while (dedentedLines[0] === "") {
    dedentedLines.shift();
  }
  while (dedentedLines[dedentedLines.length - 1] === "") {
    dedentedLines.pop();
  }
  return dedentedLines.join("\n");
}
