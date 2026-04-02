import { cli } from "@src/lib";

export const AccountRules: cli.Rule[] = [
  new cli.RuleBuilder()
    .if((args) => args.positionals("account"))
    .then((e) => e.printHelp("account", ["new", "list", "delete"], []))
    .get(),
];
