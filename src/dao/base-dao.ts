import { DbConnection, DbRecord } from "@src/db";
import { camelToSnakeCase, StringBuilder } from "@src/lib";
import { Entity } from "../model/index.ts";

export abstract class BaseDao<T extends Entity> {
  abstract readonly Table: string;
  protected conn: DbConnection;

  constructor(connection: DbConnection) {
    this.conn = connection;
  }

  save(...entities: T[]): number {
    if (entities.length === 0) {
      return 0;
    }

    const columns = Object.keys(entities[0]).map((prop) =>
      camelToSnakeCase(prop)
    );

    const sqlValuesArgs = entities
      .map((entity) =>
        Object.keys(entity).map((key) =>
          Object.getOwnPropertyDescriptor(entity, key)?.value
        )
      )
      .flat();

    const sqlBuilder = new StringBuilder()
      .l(`INSERT INTO ${this.Table} (${columns.join(", ")})`)
      .l(`VALUES`)
      .lines(
        entities.map((_) =>
          new StringBuilder()
            .s(2).a(`(${new Array(columns.length).fill("?").join(",")})`).get()
        ),
        ",",
      )
      .l("ON CONFLICT(id) DO UPDATE SET")
      .lines(
        columns.map((col) =>
          new StringBuilder()
            .s(2).a(`${col} = excluded.${col}`).get()
        ),
        ",",
      )
      .a(";");

    const result = this.conn.prepare(sqlBuilder.get()).run(...sqlValuesArgs);
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

  getAll(): T[] {
    const sql = new StringBuilder().l(`SELECT * FROM [${this.Table}]`).get();
    const records = this.conn.prepare(sql).all();
    return records.map((record) => this.entityFromRecord(record));
  }

  protected abstract entityFromRecord(record: DbRecord): T;
}
