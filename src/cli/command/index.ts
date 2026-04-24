import { cli } from "@anfi/lib";
import { accountCommand } from "./account.ts";
import { transactionCommand } from "./transaction.ts";

export const anfi = cli.builder()
  .name("anfi")
  .description("Finance tracking & budgeting tool")
  .subCommand(accountCommand)
  .subCommand(transactionCommand)
  .build();
