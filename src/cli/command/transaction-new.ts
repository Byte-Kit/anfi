import { FinancialAccountService } from "@anfi/business";
import * as schema from "@anfi/business/financial-event.schema.ts";
import { FinancialEventService } from "@anfi/business/financial-event.ts";
import { cli } from "@anfi/lib";
import { Table } from "@cliffy/table";

export const newFinancialEventCommand = cli
  .builder()
  .name("new")
  .option("amount", "Transaction amount")
  .option("description", "Optional event description")
  .option("timestamp", "Optional ISO-8601 timestamp")
  .action((exec) => {
    const { args } = exec;
    const financialAccountService = new FinancialAccountService();
    const financialEventService = new FinancialEventService();

    const existingAccounts = financialAccountService.getAllFinancialAccounts();
    if (existingAccounts.length < 2) {
      console.warn("Need at least 2 accounts to create a transaction");
      Deno.exit(1);
    }

    console.log(
      new Table(
        ...existingAccounts.map((
          { id, type, name },
          i,
        ) => [i + 1, id, type, name]),
      ).header(["", "id", "type", "name"]).border().toString(),
    );

    const sourceAccountIndex = Number(
      prompt(`Select source account (1-${existingAccounts.length}):`),
    ) - 1;
    if (
      sourceAccountIndex < 0 || sourceAccountIndex >= existingAccounts.length
    ) {
      console.warn("Invalid selection");
      Deno.exit(1);
    }

    const targetAccountIndex = Number(
      prompt(`Select target account (1-${existingAccounts.length}):`),
    ) - 1;
    if (
      targetAccountIndex < 0 || targetAccountIndex >= existingAccounts.length
    ) {
      console.warn("Invalid selection");
      Deno.exit(1);
    }

    if (sourceAccountIndex === targetAccountIndex) {
      console.warn("Source and target account cannot be the same.");
      Deno.exit(1);
    }

    const input: schema.CreateFinancialEventInput = {
      transactions: [
        {
          type: "Credit",
          amount: Number(args.amount),
          financialAccountId: existingAccounts[sourceAccountIndex].id,
        },
        {
          type: "Debit",
          amount: Number(args.amount),
          financialAccountId: existingAccounts[targetAccountIndex].id,
        },
      ],
    };

    if (args.description) {
      input.description = args.description;
    }
    if (args.timestamp) {
      input.timestamp = args.timestamp;
    }
    financialEventService.create(input);

    console.log("Ok");
    exec.done();
  })
  .build();
