import { FinancialAccountService } from "@anfi/business";
import { cli } from "@anfi/lib";

export const newAccountCommand = cli
  .builder()
  .name("new")
  .option("name")
  .option("type")
  .action(async (exec) => {
    const { args } = exec;
    await new FinancialAccountService().upsertFinancialAccount({
      id: null,
      name: args.name,
      type: args.type,
    });
    exec.done();
  })
  .build();
