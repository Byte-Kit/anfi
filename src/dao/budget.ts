import { DbRecord } from "../db/index.ts";
import { Chrono } from "../lib/index.ts";
import { Budget } from "../model/index.ts";
import { BaseDao } from "./base-dao.ts";

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
