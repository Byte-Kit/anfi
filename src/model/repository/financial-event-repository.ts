import { DbRecord, DbValue } from "@anfi/db/common.ts";
import { DbContext } from "@anfi/db/context/index.ts";
import { FinancialEvent } from "@anfi/model";
import { createRepository, Repository } from "./repository.ts";

export type FinancialEventRepository = Repository<FinancialEvent>;

export function createFinancialEventRepository(
  dbContext: DbContext,
  table: string = "financial_event",
): FinancialEventRepository {
  return createRepository({
    dbContext,
    table,
    entityFromRecord: (record: DbRecord): FinancialEvent => {
      return {
        id: String(record.id),
        timestamp: Number(record.timestamp),
        description: String(record.description),
      };
    },
    extractColumns: (): string[] => ["id", "timestamp", "description"],
    extractValues: (entity: FinancialEvent): DbValue[] => [
      entity.id,
      entity.timestamp,
      entity.description,
    ],
  });
}
