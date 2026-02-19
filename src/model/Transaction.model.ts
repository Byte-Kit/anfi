import { SQLOutputValue } from "node:sqlite";
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

  static fromDbRecord(
    record: Record<string, SQLOutputValue>,
  ): Transaction {
    return new Transaction({
      amount: Number(record.amount),
      type: String(record.type) === "Credit" ? "Credit" : "Debit",
      financialAccountId: String(record.financialAccountId),
      financialEventId: String(record.financialEventId),
    }, String(record.id));
  }

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
