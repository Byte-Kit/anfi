import { DbRecord, DbValue } from "@anfi/db/common.ts";
import { DbContext } from "@anfi/db/context/index.ts";
import { trim } from "@anfi/lib";
import { FinancialTransaction } from "@anfi/model";
import { createRepository, Repository } from "./repository.ts";

export type FinancialTransactionRepository =
  & Repository<FinancialTransaction>
  & {
    getByFinancialEventIds(eventIds: string[]): Promise<FinancialTransaction[]>;
  };

export function createTransactionRepository(
  dbContext: DbContext,
  table: string = "financial_transaction",
): FinancialTransactionRepository {
  const entityFromRecord = (record: DbRecord): FinancialTransaction => {
    return {
      id: String(record.id),
      amount: Number(record.amount),
      type: String(record.type) === "Credit" ? "Credit" : "Debit",
      financialAccountId: String(record.financial_account_id),
      financialEventId: String(record.financial_event_id),
    };
  };

  const repo = createRepository({
    dbContext,
    table,
    entityFromRecord,
    extractColumns: (): string[] => [
      "id",
      "amount",
      "type",
      "financial_account_id",
      "financial_event_id",
    ],
    extractValues: (entity: FinancialTransaction): DbValue[] => [
      entity.id,
      entity.amount,
      entity.type,
      entity.financialAccountId,
      entity.financialEventId,
    ],
  });

  return {
    ...repo,
    getByFinancialEventIds: async (ids) => {
      if (ids.length === 0) return [];
      const idsPlaceholder = new Array(ids.length).fill("?").join(", ");
      const statement = trim`
        SELECT *
        FROM [${table}]
        WHERE financial_event_id IN (${idsPlaceholder});
      `;
      const records = await dbContext.queryAsync(statement, ids);
      return records.map(entityFromRecord);
    },
  };
}
