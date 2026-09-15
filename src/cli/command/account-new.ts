import { FinancialAccountService } from "@anfi/business";
import { cli } from "@anfi/lib";
import { createFinancialAccountRepository } from "@anfi/model/repository";
import { createSqliteDbContextFromEnv } from "../services/db.ts";

export const newAccountCommand = cli
  .builder()
  .name("new")
  .option("name")
  .option("type")
  .action(async (exec) => {
    const { args } = exec;
    const dbContext = createSqliteDbContextFromEnv();
    const accountRepo = createFinancialAccountRepository(dbContext);
    const service = new FinancialAccountService(accountRepo);

    try {
      await service.upsertFinancialAccount({
        id: null,
        name: args.name,
        type: args.type,
      });
    } finally {
      await dbContext.closeAsync();
    }
    exec.done();
  })
  .build();
