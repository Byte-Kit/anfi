import { DbRecord } from "@anfi/db";
import { FinancialAccount } from "@anfi/model";
import { BaseDao } from "./common.ts";

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
