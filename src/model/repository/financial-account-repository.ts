import { DbContext } from "@anfi/db/context/index.ts";
import { FinancialAccount } from "@anfi/model";
import { createRepository, Repository } from "./repository.ts";

export type FinancialAccountRepository = Repository<FinancialAccount>;

export function createFinancialAccountRepository(
  dbContext: DbContext,
  table: string = "financial_account",
): FinancialAccountRepository {
  return createRepository<FinancialAccount>({
    dbContext,
    table,
    attributes: {
      id: { column: "id" },
      type: { column: "type" },
      name: { column: "name" },
    },
  });
}
