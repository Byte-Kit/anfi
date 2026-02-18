export * from "./FinancialAccount.model.ts";
export * from "./FinancialEvent.model.ts";
export * from "./Transaction.model.ts";
export * from "./Budget.model.ts";

export interface Entity {
  id: string;
}

export abstract class BaseEntity implements Entity {
  id: string;

  constructor(id?: string) {
    this.id = id ?? crypto.randomUUID();
  }
}
