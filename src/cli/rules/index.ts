import { cli } from "@src/lib";
import { EditAccountRules } from "./account-edit.ts";
import { ListAccountRules } from "./account-list.ts";
import { NewAccountRules } from "./account-new.ts";
import { AccountRules } from "./account.ts";
import { RmAccountRules } from "@src/cli/rules/account-rm.ts";

export const rules: cli.Rule[] = [
  new cli.RuleBuilder()
    .if((args) => args.positionals())
    .then((e) => e.printHelp("anfi", ["account", "budget", "transaction"], []))
    .get(),

  ...AccountRules,
  ...NewAccountRules,
  ...ListAccountRules,
  ...EditAccountRules,
  ...RmAccountRules,

  new cli.RuleBuilder()
    .thenDo(() => console.log("Error"))
    .get(),
];
