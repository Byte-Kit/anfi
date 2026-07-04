import { Chrono } from "@anfi/lib";

export type BudgetType = "Credit" | "Debit";

export type Budget = {
  id: string;
  periodStart: Chrono;
  periodEnd: Chrono;
  type: BudgetType;
  amount: number;
  financialAccountId: string;
};
