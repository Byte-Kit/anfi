import { DbRecord } from "@src/db";
import { FinancialEvent } from "@src/model";
import { BaseDao } from "./base-dao.ts";

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
