import { cli } from "@src/lib";
import { editAccountCommand } from "./account-edit.ts";
import { listAccountCommand } from "./account-list.ts";
import { newAccountCommand } from "./account-new.ts";
import { removeAccountCommand } from "./account-rm.ts";

export const accountCommand = cli
  .builder()
  .name("account")
  .description("Manage accounts.")
  .subCommand(newAccountCommand)
  .subCommand(editAccountCommand)
  .subCommand(listAccountCommand)
  .subCommand(removeAccountCommand)
  .build();
