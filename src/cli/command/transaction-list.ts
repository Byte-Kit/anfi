import { Table } from "@cliffy/table";
import { FinancialEventService } from "@anfi/business/financial-event.ts";
import { cli } from "@anfi/lib";
import {
  createFinancialAccountRepository,
  createFinancialEventRepository,
  createTransactionRepository,
} from "@anfi/model/repository";
import { createSqliteDbContextFromEnv } from "../services/db.ts";

export const listFinancialEventCommand = cli
  .builder()
  .name("list")
  .action(async (exec) => {
    const dbContext = createSqliteDbContextFromEnv();
    const eventRepo = createFinancialEventRepository(dbContext);
    const transactionRepo = createTransactionRepository(dbContext);
    const accountRepo = createFinancialAccountRepository(dbContext);
    const financialEventService = new FinancialEventService(
      eventRepo,
      transactionRepo,
      accountRepo,
      dbContext,
    );

    let items;
    try {
      items = await financialEventService.list();
    } finally {
      await dbContext.closeAsync();
    }
    console.log(
      new Table(
        ...items.map((
          {
            timestamp,
            sourceAccountName,
            targetAccountName,
            amount,
            description,
          },
        ) => [
          timestamp,
          sourceAccountName,
          targetAccountName,
          amount,
          description,
        ]),
      )
        .header(["timestamp", "source", "target", "amount", "description"])
        .border().toString(),
    );
    exec.done();
  })
  .build();
