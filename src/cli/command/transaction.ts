import { cli } from "@anfi/lib";
import { listFinancialEventCommand } from "./transaction-list.ts";
import { newFinancialEventCommand } from "./transaction-new.ts";

export const transactionCommand = cli
  .builder()
  .name("transaction")
  .description("Manage financial events/transactions.")
  .subCommand(listFinancialEventCommand)
  .subCommand(newFinancialEventCommand)
  .build();
