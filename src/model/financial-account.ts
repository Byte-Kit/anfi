export type FinancialAccountType =
  | "Asset"
  | "Liability"
  | "Equity"
  | "Revenue"
  | "Expense";

export type FinancialAccount = {
  id: string;
  type: FinancialAccountType;
  name: string;
};
