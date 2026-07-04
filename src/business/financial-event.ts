import { DbContext } from "@anfi/db/context/index.ts";
import { createSqliteDbContext } from "@anfi/db/context/index.ts";
import { Chrono } from "@anfi/lib";
import * as model from "@anfi/model";
import {
  createFinancialAccountRepository,
  createFinancialEventRepository,
  createTransactionRepository,
  FinancialAccountRepository,
  FinancialEventRepository,
  FinancialTransactionRepository,
} from "@anfi/model/repository";
import * as schema from "./financial-event.schema.ts";

export class FinancialEventService {
  #eventRepo: FinancialEventRepository;
  #transactionRepo: FinancialTransactionRepository;
  #accountRepo: FinancialAccountRepository;
  #dbContext: DbContext;

  constructor(
    eventRepo?: FinancialEventRepository,
    transactionRepo?: FinancialTransactionRepository,
    accountRepo?: FinancialAccountRepository,
    dbContext?: DbContext,
  ) {
    const ctx = dbContext ?? createSqliteDbContext();
    this.#dbContext = ctx;
    this.#eventRepo = eventRepo ?? createFinancialEventRepository(ctx);
    this.#transactionRepo = transactionRepo ?? createTransactionRepository(ctx);
    this.#accountRepo = accountRepo ?? createFinancialAccountRepository(ctx);
  }

  async list(): Promise<schema.FinancialEventListItem[]> {
    const events = await this.#eventRepo.getAllAsync();
    const eventIdToTransactions = Map.groupBy(
      await this.#transactionRepo.getByFinancialEventIds(
        events.map((e) => e.id),
      ),
      (t) => t.financialEventId,
    );

    const result: schema.FinancialEventListItem[] = [];
    for (const event of events) {
      const transactions = eventIdToTransactions.get(event.id) ?? [];

      const creditTransaction = transactions.find((t) => t.type === "Credit")!;
      const debitTransaction = transactions.find((t) => t.type === "Debit")!;

      const creditAccount = await this.#accountRepo.getByIdAsync(
        creditTransaction.financialAccountId,
      );
      if (!creditAccount) {
        throw "Unexpected error";
      }

      const debitAccount = await this.#accountRepo.getByIdAsync(
        debitTransaction.financialAccountId,
      );
      if (!debitAccount) {
        throw "Unexpected error";
      }

      result.push({
        timestamp: Chrono.fromUnix(event.timestamp).toString(),
        sourceAccountName: creditAccount.name,
        targetAccountName: debitAccount.name,
        amount: creditTransaction.amount,
        description: event.description,
      });
    }
    return result;
  }

  async create(input: schema.CreateFinancialEventInput) {
    const eventData = schema.CreateFinancialEvent.parse(input);

    const balance = eventData.transactions.reduce(
      (balance, { type, amount }) =>
        balance + (type === "Debit" ? amount : -amount),
      0,
    );
    if (balance !== 0) {
      throw "Invalid financial event balance";
    }

    await this.#dbContext.transactionAsync(async () => {
      const financialEvent = new model.FinancialEvent({
        description: eventData.description ?? "",
        timestamp: Chrono.from(eventData.timestamp).unix(),
      });
      const transactions = eventData.transactions.map((t) => {
        return new model.FinancialTransaction({
          amount: t.amount,
          type: t.type,
          financialAccountId: t.financialAccountId,
          financialEventId: financialEvent.id,
        });
      });

      await this.#eventRepo.saveAsync(financialEvent);
      await this.#transactionRepo.saveAsync(...transactions);
    });
  }
}
