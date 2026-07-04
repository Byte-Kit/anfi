export type FinancialTransactionType = "Credit" | "Debit";

export type FinancialTransaction = {
  id: string;
  amount: number;
  type: FinancialTransactionType;
  financialAccountId: string;
  financialEventId: string;
};
