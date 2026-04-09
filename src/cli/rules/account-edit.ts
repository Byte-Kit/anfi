import { assert, cli } from "@src/lib";
import { FinancialAccountService } from "@src/business/financial-account.ts";
import { Table } from "@cliffy/table";

interface EditAccountOpts extends cli.Opts {
  type: string;
  name: string;
}

function builder() {
  return new cli
    .RuleBuilder<EditAccountOpts>()
    .parser({ string: ["name", "type"] })
    .ifPositionals("account", "edit");
}

export const EditAccountRules: cli.Rule[] = [
  builder()
    .ifOpts(({ help }) => assert.boolean(help).equals(true))
    .then((e) => e.printHelp("edit", [], []))
    .get(),
  builder()
    .thenDo((args) => {
      const opts: EditAccountOpts = args.opts();
      const service = new FinancialAccountService();

      const accounts = service.listFinancialAccounts();
      if (accounts.length === 0) {
        console.warn("No existing account to edit");
        Deno.exit(1);
      }

      console.log(
        new Table(
          ...accounts.map(({ type, name }, index) => [
            index + 1,
            type,
            name,
          ]),
        ).header(["", "type", "name"]).border().toString(),
      );
      const index = Number(
        prompt(`Select an account to edit (1-${accounts.length}):`),
      ) - 1;
      if (index < 0 || index >= accounts.length) {
        console.warn("Invalid selection");
        Deno.exit(1);
      }

      service.upsertFinancialAccount({
        id: accounts[index].id,
        name: opts.name,
        type: opts.type,
      });
      console.log("Ok");
    })
    .get(),
];
