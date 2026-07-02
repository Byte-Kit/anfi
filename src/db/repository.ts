import { DbContext, DbRecord } from "@anfi/db/context/index.ts";
import { trim } from "@anfi/lib";

export type Entity = Record<string, string | number | boolean>;

export type RepositoryOptions<T extends Entity> = {
  dbContext: DbContext;
  table: string;

  entityFromRecord: (record: DbRecord) => T;
  extractColumns: (entity: T) => string[];
};

export type Repository<T> = {
  saveAsync(...entities: T[]): Promise<number>;
  getAllAsync(): Promise<T[]>;
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
      const values = entities
        .map(() => `(${new Array(columns.length).fill("?").join(",")})`)
        .join(", ");
      const updates = columns
        .map((col) => `${col} = excluded.${col}`)
        .join(", ");
      const statement = trim`
        INSERT INTO [${table}] (${columns})
        VALUES
          ${values}
        ON CONFLICT(id) DO UPDATE SET
          ${updates}
        ;
      `;
      return await dbContext.executeAsync(statement);
    },

    getAllAsync: async (): Promise<T[]> => {
      const statement = trim`SELECT * FROM [${table}]`;
      const records = await dbContext.queryAsync(statement);
      return records.map(entityFromRecord);
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
