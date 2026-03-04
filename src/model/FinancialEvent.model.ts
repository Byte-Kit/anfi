import { BaseEntity } from "./Abstract.model.ts";

export interface FinancialEventData {
  timestamp: number;
  description: string;
}

export class FinancialEvent extends BaseEntity implements FinancialEventData {
  timestamp: number;
  description: string;

  constructor({ timestamp, description }: FinancialEventData, id?: string) {
    super(id);
    this.timestamp = timestamp;
    this.description = description;
  }
}
