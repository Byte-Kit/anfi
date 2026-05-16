import { DbRecord } from "@anfi/db";
import { StringBuilder } from "@anfi/lib";
import { Transaction } from "@anfi/model";
import { BaseDao } from "./common.ts";

export class TransactionDao extends BaseDao<Transaction> {
  override Table: string = "financial_transaction";

  getByFinancialEventId(eventId: string): Transaction[] {
    const sql = new StringBuilder()
      .a("SELECT *").n()
      .a(`FROM [${this.Table}]`).n()
      .a("WHERE financial_event_id = ?")
      .get();
    const records = this.conn.prepare(sql).all(eventId);
    return records.map((record) => this.entityFromRecord(record));
  }

  protected override entityFromRecord(record: DbRecord): Transaction {
    return new Transaction(
      {
        amount: Number(record.amount),
        type: String(record.type) === "Credit" ? "Credit" : "Debit",
        financialAccountId: String(record.financialAccountId),
        financialEventId: String(record.financialEventId),
      },
      String(record.id),
    );
  }
}
