import { BaseEntity } from "./Abstract.model.ts";

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
    id?: string,
  ) {
    super(id);
    this.amount = amount;
    this.type = type;
    this.financialAccountId = financialAccountId;
    this.financialEventId = financialEventId;
  }
}
