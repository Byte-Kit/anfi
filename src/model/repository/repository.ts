import { DbRecord, DbValue } from "@anfi/db/common.ts";
import { DbContext } from "@anfi/db/context/index.ts";
import { trim } from "@anfi/lib";

export type Entity = Record<string, unknown>;

export type RepositoryOptions = {
  dbContext: DbContext;
  table: string;

  attributes: Record<string, {
    column: string;
    DbType?: (value: DbValue) => unknown;
    AttributeType?: (value: unknown) => DbValue;
  }>;
};

export type Repository<T extends Entity = Entity> = {
  saveAsync(...entities: T[]): Promise<number>;
  getAllAsync(): Promise<T[]>;
  getByIdAsync(id: string): Promise<T | null>;
  getByIdsAsync(id: string[]): Promise<T[]>;
  deleteByIdsAsync(ids: string[]): Promise<number>;
};

export function createRepository<T extends Entity = Entity>(
  opts: RepositoryOptions,
): Repository<T> {
  const { dbContext, table } = opts;
  const [attributes, columns] = Object
    .entries(opts.attributes)
    .reduce<[string[], string[]]>(
      (
        [attributes, columns],
        [attribute, { column }],
      ) => [attributes.concat(attribute), columns.concat(column)],
      [[], []],
    );

  const attributeToDbValueParser = Object
    .entries(opts.attributes)
    .reduce<Record<string, (value: unknown) => DbValue>>(
      (dict, [attribute, { AttributeType }]) => {
        dict[attribute] = (value: unknown) => {
          if (AttributeType) {
            return AttributeType(value);
          } else if (typeof value === "number") {
            return Number(value);
          } else return String(value);
        };
        return dict;
      },
      {},
    );

  const attributeToEntityValueParser = Object
    .entries(opts.attributes)
    .reduce<Record<string, (value: DbValue) => unknown>>(
      (dict, [attribute, { DbType }]) => {
        dict[attribute] = (value: DbValue) => {
          if (DbType) {
            return DbType(value);
          } else if (typeof value === "number") {
            return Number(value);
          } else return String(value);
        };
        return dict;
      },
      {},
    );

  const mapDbRecordToEntity = (record: DbRecord) => {
    return attributes.reduce<Entity>((entity, attribute) => {
      const column = opts.attributes[attribute].column;
      const DbType = attributeToEntityValueParser[attribute];
      entity[attribute] = DbType ? DbType(record[column]) : record[column];
      return entity;
    }, {}) as T;
  };

  return {
    saveAsync: async (...entities: T[]): Promise<number> => {
      if (entities.length === 0) {
        return 0;
      }

      const values = entities.flatMap((e) =>
        attributes.map((attribute) => {
          const dbValueParser = attributeToDbValueParser[attribute];
          return dbValueParser(e[attribute]);
        })
      );
      const valuesPlaceholder = entities
        .map(() => `(${new Array(columns.length).fill("?").join(",")})`)
        .join(", ");
      const updates = columns
        .map((col) => `${col} = excluded.${col}`)
        .join(", ");
      const statement = trim`
        INSERT INTO [${table}] (${columns})
        VALUES
          ${valuesPlaceholder}
        ON CONFLICT(id) DO UPDATE SET
          ${updates}
        ;
      `;
      return await dbContext.executeAsync(statement, values);
    },

    getAllAsync: async (): Promise<T[]> => {
      const statement = trim`SELECT * FROM [${table}]`;
      const records = await dbContext.queryAsync(statement);
      return records.map(mapDbRecordToEntity);
    },

    getByIdAsync: async (id: string): Promise<T | null> => {
      const statement = trim`SELECT * FROM [${table}] WHERE id = ?`;
      const records = await dbContext.queryAsync(statement, [id]);
      return (records[0] ? mapDbRecordToEntity(records[0]) : null);
    },

    getByIdsAsync: async (ids: string[]): Promise<T[]> => {
      if (ids.length === 0) {
        return [];
      }

      const statement = trim`
        SELECT *
        FROM [${table}]
        WHERE id IN (${new Array(ids.length).fill("?").join(", ")})
      `;
      const records = await dbContext.queryAsync(statement, ids);
      return records.map(mapDbRecordToEntity);
    },

    deleteByIdsAsync: async (ids: string[]): Promise<number> => {
      if (ids.length === 0) {
        return 0;
      }

      const statement = trim`
        DELETE FROM ${table}
        WHERE id IN (${new Array(ids.length).fill("?").join(", ")})
      `;
      return await dbContext.executeAsync(statement, ids);
    },
  } as Repository<T>;
}
