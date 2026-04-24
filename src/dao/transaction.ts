import { DbRecord } from "@anfi/db";
import { Transaction } from "@anfi/model";
import { BaseDao } from "./common.ts";

export class TransactionDao extends BaseDao<Transaction> {
  override Table: string = "transaction";

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
