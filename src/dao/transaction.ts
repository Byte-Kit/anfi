import { DbRecord } from "@anfi/db";
import { StringBuilder } from "@anfi/lib";
import { Transaction } from "@anfi/model";
import { BaseDao } from "./common.ts";

export class TransactionDao extends BaseDao<Transaction> {
  override Table: string = "financial_transaction";

  getByFinancialEventIds(eventIds: string[]): Transaction[] {
    if (eventIds.length === 0) {
      return [];
    }

    const sql = new StringBuilder()
      .a("SELECT *").n()
      .a(`FROM [${this.Table}]`).n()
      .a("WHERE financial_event_id IN (")
      .lines(
        eventIds.map((_) =>
          new StringBuilder()
            .a("?").get()
        ),
        ",",
      )
      .a(")")
      .get();
    const records = this.conn.prepare(sql).all(...eventIds);
    return records.map((record) => this.entityFromRecord(record));
  }

  protected override entityFromRecord(record: DbRecord): Transaction {
    return new Transaction(
      {
        amount: Number(record.amount),
        type: String(record.type) === "Credit" ? "Credit" : "Debit",
        financialAccountId: String(record.financial_account_id),
        financialEventId: String(record.financial_event_id),
      },
      String(record.id),
    );
  }
}
