import { BaseEntity } from "./base-entity.ts";

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

  constructor({ type, name }: FinancialAccountData, id: string | null = null) {
    super(id);
    this.type = type;
    this.name = name;
  }
}
