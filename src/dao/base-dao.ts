import { Entity } from "../model/index.ts";
import { DbConnection, DbRecord } from "../db/index.ts";
import { camelToSnakeCase, StringBuilder } from "../lib/string.ts";

export abstract class BaseDao<T extends Entity> {
  abstract readonly Table: string;
  protected conn: DbConnection;

  constructor(connection: DbConnection) {
    this.conn = connection;
  }

  save(entity: T): number {
    const columns = Object.keys(entity).map((prop) => camelToSnakeCase(prop));

    const sqlBuilder = new StringBuilder()
      .a(`INSERT INTO ${this.Table} (`).n()
      .a(
        ...columns.map((column, index, keys) => {
          const isLastKey = index === keys.length - 1;
          return new StringBuilder()
            .s(2).a(`${column}`).a(isLastKey ? "" : ",").n()
            .get();
        }),
      )
      .a(")").n()
      .a(`VALUES (${new Array(columns.length).fill("?").join(",")})`).n()
      .a("ON CONFLICT(id) DO UPDATE SET").n()
      .a(
        ...columns.map((column, index, columns) => {
          const lastColumn = index === columns.length - 1;
          return new StringBuilder()
            .s(2).a(`${column} = excluded.${column}`).a(lastColumn ? "" : ",")
            .n()
            .get();
        }),
      )
      .a(";");

    const result = this.conn.prepare(sqlBuilder.get()).run(
      ...Object.keys(entity).map((key) =>
        Object.getOwnPropertyDescriptor(entity, key)?.value
      ),
    );

    return Number(result.changes);
  }

  getById(id: string): T | null {
    const sql = new StringBuilder()
      .a("SELECT *").n()
      .a(`FROM [${this.Table}]`).n()
      .a(`WHERE id = ?`)
      .get();
    const record = this.conn
      .prepare(sql)
      .get(id);
    return record ? this.entityFromRecord(record) : null;
  }

  protected abstract entityFromRecord(record: DbRecord): T;
}
