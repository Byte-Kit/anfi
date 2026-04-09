import { assert, cli } from "@src/lib";
import { FinancialAccountService } from "@src/business/financial-account.ts";
import { Table } from "@cliffy/table";

function builder() {
  return new cli
    .RuleBuilder()
    .ifPositionals("account", "list");
}

export const ListAccountRules: cli.Rule[] = [
  builder()
    .ifOpts(({ help }) => assert.boolean(help).equals(true))
    .then((e) => e.printHelp("list", [], []))
    .get(),
  builder()
    .thenDo((_) => {
      const accounts = new FinancialAccountService().listFinancialAccounts();
      const table = new Table(...accounts.map(
        ({ type, name }, index) => [index + 1, type, name],
      )).header(["", "type", "name"]).border();
      console.log(table.toString());
    })
    .get(),
];
