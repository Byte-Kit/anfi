import { Chrono } from "@anfi/lib/index.ts";
import { BaseEntity } from "./base-entity.ts";
import { TransactionType } from "./index.ts";

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
