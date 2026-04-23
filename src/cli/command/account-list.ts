import { Table } from "@cliffy/table";
import { FinancialAccountService } from "@src/business/financial-account.ts";
import { cli } from "@src/lib";

export const listAccountCommand = cli
  .builder()
  .name("list")
  .action(() => {
    const accounts = new FinancialAccountService().listFinancialAccounts();
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
  })
  .build();
