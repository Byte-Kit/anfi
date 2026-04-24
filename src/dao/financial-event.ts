import { DbRecord } from "@anfi/db";
import { FinancialEvent } from "@anfi/model";
import { BaseDao } from "./common.ts";

export class FinancialEventDao extends BaseDao<FinancialEvent> {
  override Table: string = "financial_event";

  protected override entityFromRecord(record: DbRecord): FinancialEvent {
    return new FinancialEvent(
      {
        timestamp: Number(record.timestamp),
        description: String(record.description),
      },
      String(record.id),
    );
  }
}
