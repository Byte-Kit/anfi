import { Table } from "@cliffy/table";
import { FinancialAccountService } from "@anfi/business";
import { cli } from "@anfi/lib";

export const listAccountCommand = cli
  .builder()
  .name("list")
  .action(() => {
    const accounts = new FinancialAccountService().getAllFinancialAccounts();
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
