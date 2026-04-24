import { DbRecord } from "@anfi/db";
import { Chrono } from "@anfi/lib";
import { Budget } from "@anfi/model";
import { BaseDao } from "./common.ts";

export class BudgetDao extends BaseDao<Budget> {
  override Table: string = "budget";

  protected override entityFromRecord(record: DbRecord): Budget {
    return new Budget(
      {
        periodStart: Chrono.from(Number(record.periodStart)),
        periodEnd: Chrono.from(Number(record.periodEnd)),
        type: String(record.type) === "Credit" ? "Credit" : "Debit",
        amount: Number(record.amount),
        financialAccountId: String(record.financialAccountId),
      },
      String(record.id),
    );
  }
}
