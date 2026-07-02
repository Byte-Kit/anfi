import { DbRecord, DbValue } from "@anfi/db/common.ts";
import { DbContext } from "@anfi/db/context/index.ts";
import { FinancialAccount, FinancialAccountType } from "@anfi/model";
import { createRepository, Repository } from "./repository.ts";

export type FinancialAccountRepository = Repository<FinancialAccount>;

export function createFinancialAccountRepository(
  dbContext: DbContext,
  table: string = "financial_account",
): FinancialAccountRepository {
  return createRepository({
    dbContext,
    table,
    entityFromRecord: (record: DbRecord): FinancialAccount => {
      return new FinancialAccount(
        {
          type: String(record.type) as FinancialAccountType,
          name: String(record.name),
        },
        String(record.id),
      );
    },
    extractColumns: (): string[] => ["id", "type", "name"],
    extractValues: (entity: FinancialAccount): DbValue[] => [
      entity.id,
      entity.type,
      entity.name,
    ],
  });
}
