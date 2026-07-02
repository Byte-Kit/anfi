import { Table } from "@cliffy/table";
import { FinancialEventService } from "@anfi/business/financial-event.ts";
import { cli } from "@anfi/lib";

export const listFinancialEventCommand = cli
  .builder()
  .name("list")
  .action(async (exec) => {
    const items = await new FinancialEventService().list();
    console.log(
      new Table(
        ...items.map((
          {
            timestamp,
            sourceAccountName,
            targetAccountName,
            amount,
            description,
          },
        ) => [
          timestamp,
          sourceAccountName,
          targetAccountName,
          amount,
          description,
        ]),
      )
        .header(["timestamp", "source", "target", "amount", "description"])
        .border().toString(),
    );
    exec.done();
  })
  .build();
