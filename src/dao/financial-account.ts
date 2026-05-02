import { DbRecord } from "@anfi/db";
import { FinancialAccount, FinancialAccountType } from "@anfi/model";
import { BaseDao } from "./common.ts";

export class FinancialAccountDao extends BaseDao<FinancialAccount> {
  override Table: string = "financial_account";

  protected override entityFromRecord(record: DbRecord): FinancialAccount {
    return new FinancialAccount(
      {
        type: String(record.type) as FinancialAccountType,
        name: String(record.name),
      },
      String(record.id),
    );
  }
}
