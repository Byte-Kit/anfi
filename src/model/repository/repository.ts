import { DbRecord, DbValue } from "@anfi/db/common.ts";
import { DbContext } from "@anfi/db/context/index.ts";
import { trim } from "@anfi/lib";

export type Entity = object;

export type RepositoryOptions<T extends Entity> = {
  dbContext: DbContext;
  table: string;

  entityFromRecord: (record: DbRecord) => T;
  extractColumns: (entity: T) => string[];
  extractValues: (entity: T) => DbValue[];
};

export type Repository<T> = {
  saveAsync(...entities: T[]): Promise<number>;
  getAllAsync(): Promise<T[]>;
  getByIdAsync(id: string): Promise<T | null>;
  getByIdsAsync(id: string[]): Promise<T[]>;
  deleteByIdsAsync(ids: string[]): Promise<number>;
};

export function createRepository<T extends Entity>(
  opts: RepositoryOptions<T>,
): Repository<T> {
  const { dbContext, table, entityFromRecord } = opts;

  return {
    saveAsync: async (...entities: T[]): Promise<number> => {
      if (entities.length === 0) {
        return 0;
      }

      const columns = opts.extractColumns(entities[0]);
      const valuesPlaceholder = entities
        .map(() => `(${new Array(columns.length).fill("?").join(",")})`)
        .join(", ");
      const values = entities.flatMap((e) => opts.extractValues(e));
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
      return records.map(entityFromRecord);
    },

    getByIdAsync: async (id: string): Promise<T | null> => {
      const statement = trim`SELECT * FROM [${table}] WHERE id = ?`;
      const records = await dbContext.queryAsync(statement, [id]);
      return records[0] ? entityFromRecord(records[0]) : null;
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
      return records.map(entityFromRecord);
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
  };
}
