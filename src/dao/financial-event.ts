import { DbRecord } from "../db/index.ts";
import { FinancialEvent } from "../model/index.ts";
import { BaseDao } from "./index.ts";

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
