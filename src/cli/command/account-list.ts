import { Table } from "@cliffy/table";
import { FinancialAccountService } from "@anfi/business";
import { cli } from "@anfi/lib";
import { createFinancialAccountRepository } from "@anfi/model/repository";
import { createSqliteDbContextFromEnv } from "../services/db.ts";

export const listAccountCommand = cli
  .builder()
  .name("list")
  .action(async (exec) => {
    const dbContext = createSqliteDbContextFromEnv();
    const accountRepo = createFinancialAccountRepository(dbContext);
    const service = new FinancialAccountService(accountRepo);

    let accounts;
    try {
      accounts = await service.getAllFinancialAccounts();
    } finally {
      await dbContext.closeAsync();
    }

    console.log(
      new Table(
        ...accounts.map(({ id, type, name }, index) => [
          index + 1,
          id,
          type,
          name,
        ]),
      ).header(["", "id", "type", "name"]).border().toString(),
    );
    exec.done();
  })
  .build();
