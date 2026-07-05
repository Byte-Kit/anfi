import { DbContext } from "@anfi/db/context/index.ts";
import { FinancialEvent } from "@anfi/model";
import { createRepository, Repository } from "./repository.ts";

export type FinancialEventRepository = Repository<FinancialEvent>;

export function createFinancialEventRepository(
  dbContext: DbContext,
  table: string = "financial_event",
): FinancialEventRepository {
  return createRepository<FinancialEvent>({
    dbContext,
    table,
    attributes: {
      id: { column: "id" },
      timestamp: { column: "timestamp" },
      description: { column: "description" },
    },
  });
}
