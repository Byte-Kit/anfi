import { BaseEntity } from "@anfi/model/common.ts";

export interface FinancialEventData {
  timestamp: number;
  description: string;
}

export class FinancialEvent extends BaseEntity implements FinancialEventData {
  timestamp: number;
  description: string;

  constructor(
    { timestamp, description }: FinancialEventData,
    id: string | null = null,
  ) {
    super(id);
    this.timestamp = timestamp;
    this.description = description;
  }
}
