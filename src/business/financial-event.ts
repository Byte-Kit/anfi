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
    if (events.length === 0) {
      return [];
    }

    const allTransactions = await this.#transactionRepo.getByFinancialEventIds(
      events.map((e) => e.id),
    );
    const eventIdToTransactions = Map.groupBy(
      allTransactions,
      (t) => t.financialEventId,
    );

    const accountIds = Array.from(
      new Set(allTransactions.map((t) => t.financialAccountId)),
    );
    const accounts = await this.#accountRepo.getByIdsAsync(accountIds);
    const accountIdToAccount = new Map(accounts.map((a) => [a.id, a]));

    const result: schema.FinancialEventListItem[] = [];
    for (const event of events) {
      const transactions = eventIdToTransactions.get(event.id) ?? [];

      const creditTransaction = transactions.find((t) => t.type === "Credit");
      const debitTransaction = transactions.find((t) => t.type === "Debit");

      if (!creditTransaction || !debitTransaction) {
        throw new Error(
          "Financial event must have at least one Credit and one Debit transaction",
        );
      }

      const creditAccount = accountIdToAccount.get(
        creditTransaction.financialAccountId,
      );
      if (!creditAccount) {
        throw new Error(
          `Credit account not found: ${creditTransaction.financialAccountId}`,
        );
      }

      const debitAccount = accountIdToAccount.get(
        debitTransaction.financialAccountId,
      );
      if (!debitAccount) {
        throw new Error(
          `Debit account not found: ${debitTransaction.financialAccountId}`,
        );
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
      throw new Error("Invalid financial event balance");
    }

    await this.#dbContext.transactionAsync(async () => {
      const financialEvent: model.FinancialEvent = {
        id: crypto.randomUUID(),
        description: eventData.description ?? "",
        timestamp: Chrono.from(eventData.timestamp).unix(),
      };
      const transactions = eventData.transactions.map((t) => {
        return {
          id: crypto.randomUUID(),
          amount: t.amount,
          type: t.type,
          financialAccountId: t.financialAccountId,
          financialEventId: financialEvent.id,
        } satisfies model.FinancialTransaction;
      });

      await this.#eventRepo.saveAsync(financialEvent);
      await this.#transactionRepo.saveAsync(...transactions);
    });
  }
}
