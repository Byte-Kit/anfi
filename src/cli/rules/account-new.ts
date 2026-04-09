import { FinancialAccountService } from "@src/business/financial-account.ts";
import { assert, cli } from "@src/lib";

interface NewAccountOpts extends cli.Opts {
  type: string;
  name: string;
}

function builder() {
  return new cli
    .RuleBuilder<NewAccountOpts>()
    .parser({ string: ["name"] })
    .ifPositionals("account", "new");
}

export const NewAccountRules: cli.Rule[] = [
  builder()
    .ifOpts(({ help }) => assert.boolean(help).equals(true))
    .then((e) => e.printHelp("new", [], ["name", "type"]))
    .get(),
  builder()
    .thenDo((args) => {
      const opts: NewAccountOpts = args.opts();
      const service = new FinancialAccountService();
      service.upsertFinancialAccount({
        id: null,
        name: opts.name,
        type: opts.type,
      });
    })
    .get(),
];
