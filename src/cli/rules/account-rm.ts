import { Table } from "@cliffy/table";
import { FinancialAccountService } from "@src/business/financial-account.ts";
import { assert, cli } from "@src/lib";

function builder() {
  return new cli.RuleBuilder().ifPositionals("account", "rm");
}

export const RmAccountRules: cli.Rule[] = [
  builder()
    .ifOpts(({ help }) => assert.boolean(help).equals(true))
    .then((e) => e.printHelp("rm", [], []))
    .get(),
  builder()
    .thenDo((_args) => {
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
        prompt(`Select an account to remove (1-${accounts.length}):`),
      ) - 1;
      if (index < 0 || index >= accounts.length) {
        console.warn("Invalid selection");
        Deno.exit(1);
      }

      service.deleteFinancialAccountByIds([accounts[index].id]);
      console.log("Ok");
    })
    .get(),
];
