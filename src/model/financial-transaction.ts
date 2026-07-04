import { BaseEntity } from "@anfi/model/common.ts";

export interface FinancialTransactionData {
  amount: number;
  type: FinancialTransactionType;

  financialAccountId: string;
  financialEventId: string;
}
export type FinancialTransactionType = "Credit" | "Debit";

export class FinancialTransaction extends BaseEntity
  implements FinancialTransactionData {
  amount: number;
  type: FinancialTransactionType;
  financialAccountId: string;
  financialEventId: string;

  constructor(
    { amount, type, financialAccountId, financialEventId }:
      FinancialTransactionData,
    id: string | null = null,
  ) {
    super(id);
    this.amount = amount;
    this.type = type;
    this.financialAccountId = financialAccountId;
    this.financialEventId = financialEventId;
  }
}
