import { cli } from "@anfi/lib";
import { newFinancialEventCommand } from "./transaction-new.ts";

export const transactionCommand = cli
  .builder()
  .name("transaction")
  .description("Manage financial events/transactions.")
  .subCommand(newFinancialEventCommand)
  .build();
