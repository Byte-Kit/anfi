import { Chrono } from "@anfi/lib/index.ts";
import { BaseEntity, TransactionType } from "./index.ts";
import { SQLOutputValue } from "node:sqlite";

export interface BudgetData {
  periodStart: Chrono;
  periodEnd: Chrono;
  type: TransactionType;
  amount: number;

  financialAccountId: string;
}

export class Budget extends BaseEntity implements BudgetData {
  periodStart: Chrono;
  periodEnd: Chrono;
  type: TransactionType;
  amount: number;
  financialAccountId: string;

  static fromDbRecord(
    record: Record<string, SQLOutputValue>,
  ): Budget {
    return new Budget({
      periodStart: Chrono.from(Number(record.periodStart)),
      periodEnd: Chrono.from(Number(record.periodEnd)),
      type: String(record.type) === "Credit" ? "Credit" : "Debit",
      amount: Number(record.amount),
      financialAccountId: String(record.financialAccountId),
    }, String(record.id));
  }

  constructor(
    { periodStart, periodEnd, type, amount, financialAccountId }: BudgetData,
    id?: string,
  ) {
    super(id);
    this.periodStart = periodStart;
    this.periodEnd = periodEnd;
    this.type = type;
    this.amount = amount;
    this.financialAccountId = financialAccountId;
  }
}
