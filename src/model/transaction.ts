import { BaseEntity } from "@anfi/model/common.ts";

export interface TransactionData {
  amount: number;
  type: TransactionType;

  financialAccountId: string;
  financialEventId: string;
}
export type TransactionType = "Credit" | "Debit";

export class Transaction extends BaseEntity implements TransactionData {
  amount: number;
  type: TransactionType;
  financialAccountId: string;
  financialEventId: string;

  constructor(
    { amount, type, financialAccountId, financialEventId }: TransactionData,
    id: string | null = null,
  ) {
    super(id);
    this.amount = amount;
    this.type = type;
    this.financialAccountId = financialAccountId;
    this.financialEventId = financialEventId;
  }
}
