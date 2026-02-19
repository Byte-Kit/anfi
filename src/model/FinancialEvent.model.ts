import { SQLOutputValue } from "node:sqlite";
import { BaseEntity } from "./Abstract.model.ts";

export interface FinancialEventData {
  timestamp: number;
  description: string;
}

export class FinancialEvent extends BaseEntity implements FinancialEventData {
  timestamp: number;
  description: string;

  static fromDbRecord(
    record: Record<string, SQLOutputValue>,
  ): FinancialEvent {
    return new FinancialEvent({
      timestamp: Number(record.timestamp),
      description: String(record.description),
    }, String(record.id));
  }

  constructor({ timestamp, description }: FinancialEventData, id?: string) {
    super(id);
    this.timestamp = timestamp;
    this.description = description;
  }
}
