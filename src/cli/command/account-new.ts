import { FinancialAccountService } from "@anfi/business";
import { cli } from "@anfi/lib";

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
