import { SQLOutputValue } from "node:sqlite";
import { BaseEntity } from "./index.ts";

export interface FinancialAccountData {
  type: FinancialAccountType;
  name: string;
}
export enum FinancialAccountType {
  Asset = 1,
  Liability,
  Equity,
  Revenue,
  Expense,
}

export class FinancialAccount extends BaseEntity
  implements FinancialAccountData {
  type: FinancialAccountType;
  name: string;

  static fromDbRecord(
    record: Record<string, SQLOutputValue>,
  ): FinancialAccount {
    return new FinancialAccount({
      type: Number(record.type),
      name: String(record.name),
    }, String(record.id));
  }

  constructor({ type, name }: FinancialAccountData, id?: string) {
    super(id);
    this.type = type;
    this.name = name;
  }
}
