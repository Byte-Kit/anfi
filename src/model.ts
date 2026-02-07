import { Chrono } from "@anfi/lib/index.ts";

export type FinancialAccount = {
  id: string;
  type: FinancialAccountType;
  name: string;
};

export enum FinancialAccountType {
  Asset = 1,
  Liability,
  Equity,
  Revenue,
  Expense,
}

export type FinancialEvent = {
  id: string;
  timestamp: number;
  description: string;
};

export type Transaction = {
  id: string;
  amount: number;
  type: TransactionType;

  financialAccountId: string;
  financialEventId: string;
};

export type TransactionType = "Credit" | "Debit";

export type Budget = {
  id: string;
  periodStart: Chrono;
  periodEnd: Chrono;
  type: TransactionType;
  amount: number;

  financialAccountId: string;
};
