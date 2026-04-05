import { DbRecord } from "@src/db/index.ts";
import { FinancialAccount } from "../model/index.ts";
import { BaseDao } from "./base-dao.ts";

export class FinancialAccountDao extends BaseDao<FinancialAccount> {
  override Table: string = "financial_account";

  protected override entityFromRecord(record: DbRecord): FinancialAccount {
    return new FinancialAccount(
      {
        type: Number(record.type),
        name: String(record.name),
      },
      String(record.id),
    );
  }
}
