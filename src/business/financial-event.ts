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

    const events = eventDao.getAll();
    const eventIdToTransactions = Map.groupBy(
      transactionDao.getByFinancialEventIds(events.map((e) => e.id)),
      (t) => t.financialEventId,
    );

    return events.map((event) => {
      const transactions = eventIdToTransactions.get(event.id) ?? [];
      if (!transactions) {
        throw "Unexpected error";
      }

      const creditTransaction = transactions.find((t) => t.type === "Credit")!;
      const debitTransaction = transactions.find((t) => t.type === "Debit")!;

      const creditAccount = accountDao.getById(
        creditTransaction.financialAccountId,
      );
      if (!creditAccount) {
        throw "Unexpected error";
      }

      const debitAccount = accountDao.getById(
        debitTransaction.financialAccountId,
      );
      if (!debitAccount) {
        throw "Unexpected error";
      }

      return {
        timestamp: Chrono.fromUnix(event.timestamp).toString(),
        sourceAccountName: creditAccount.name,
        targetAccountName: debitAccount.name,
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
