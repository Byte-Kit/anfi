import { cli } from "@src/lib";
import { AccountRules } from "./account.ts";
import { NewAccountRules } from "./account-new.ts";

export const rules: cli.Rule[] = [
  new cli.RuleBuilder()
    .if((args) => args.positionals())
    .then((e) => e.printHelp("anfi", ["account", "budget", "transaction"], []))
    .get(),

  ...AccountRules,
  ...NewAccountRules,

  new cli.RuleBuilder()
    .thenDo(() => console.log("Error"))
    .get(),
];
