import { FinancialAccountDao, FinancialEventDao } from "@anfi/dao";
import { TransactionDao } from "@anfi/dao/transaction.ts";
import * as db from "@anfi/db";
import { Chrono } from "@anfi/lib";
import * as model from "@anfi/model";
import * as schema from "./financial-event.schema.ts";

export class FinancialEventService {
  list(): schema.FinancialEventListItem[] {
    const conn = new db.ConnectionBuilder().get();
    const eventDao = new FinancialEventDao(conn);
    const transactionDao = new TransactionDao(conn);
    const accountDao = new FinancialAccountDao(conn);

    return eventDao.getAll().map((event) => {
      const transactions = transactionDao.getByFinancialEventId(event.id);
      const creditTransaction = transactions.find((t) => t.type === "Credit")!;
      const debitTransaction = transactions.find((t) => t.type === "Debit")!;
      const sourceAccount = accountDao.getById(
        creditTransaction.financialAccountId,
      )!;
      const targetAccount = accountDao.getById(
        debitTransaction.financialAccountId,
      )!;

      return {
        timestamp: Chrono.fromUnix(event.timestamp).toString(),
        sourceAccountName: sourceAccount.name,
        targetAccountName: targetAccount.name,
        amount: creditTransaction.amount,
        description: event.description,
      };
    });
  }

  create(input: schema.CreateFinancialEventInput) {
    const eventData = schema.CreateFinancialEvent.parse(input);

    const balance = eventData.transactions.reduce(
      (balance, { type, amount }) =>
        balance + (type === "Debit" ? amount : -amount),
      0,
    );
    if (balance !== 0) {
      throw "Invalid financial event balance";
    }

    const conn = new db.ConnectionBuilder().get();
    const financialEventDao = new FinancialEventDao(conn);
    const transactionDao = new TransactionDao(conn);

    db.transact(() => {
      const financialEvent = new model.FinancialEvent({
        description: eventData.description ?? "",
        timestamp: Chrono.from(eventData.timestamp).unix(),
      });
      const transactions = eventData.transactions.map((t) => {
        return new model.Transaction({
          amount: t.amount,
          type: t.type,
          financialAccountId: t.financialAccountId,
          financialEventId: financialEvent.id,
        });
      });

      financialEventDao.save(financialEvent);
      transactionDao.save(...transactions);
    }, conn);
  }
}
