import { Chrono } from "@anfi/lib";
import { BaseEntity } from "./common.ts";

export type BudgetType = "Credit" | "Debit";

export interface BudgetData {
  periodStart: Chrono;
  periodEnd: Chrono;
  type: BudgetType;
  amount: number;

  financialAccountId: string;
}

export class Budget extends BaseEntity implements BudgetData {
  periodStart: Chrono;
  periodEnd: Chrono;
  type: BudgetType;
  amount: number;
  financialAccountId: string;

  constructor(
    { periodStart, periodEnd, type, amount, financialAccountId }: BudgetData,
    id: string | null = null,
  ) {
    super(id);
    this.periodStart = periodStart;
    this.periodEnd = periodEnd;
    this.type = type;
    this.amount = amount;
    this.financialAccountId = financialAccountId;
  }
}
