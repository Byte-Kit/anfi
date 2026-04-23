import { cli } from "@src/lib";
import { FinancialAccountService } from "@src/business/financial-account.ts";

export const newAccountCommand = cli
  .builder()
  .name("new")
  .option("name")
  .option("type")
  .action(({ args, done }) => {
    new FinancialAccountService().upsertFinancialAccount({
      id: null,
      name: args.name,
      type: args.type,
    });
    done();
  })
  .build();
