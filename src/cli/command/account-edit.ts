import { Table } from "@cliffy/table";
import { FinancialAccountService } from "@anfi/business";
import { cli } from "@anfi/lib";

export const editAccountCommand = cli
  .builder()
  .name("edit")
  .action(({ args: opts }) => {
    const service = new FinancialAccountService();

    const accounts = service.listFinancialAccounts();
    if (accounts.length === 0) {
      console.warn("No existing account to edit");
      Deno.exit(1);
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
  .build();
