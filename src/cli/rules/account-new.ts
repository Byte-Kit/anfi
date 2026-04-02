import { assert, cli } from "@src/lib";

interface NewAccountOpts extends cli.Opts {
  type: string;
  name: string;
}

function builder() {
  return new cli
    .RuleBuilder<NewAccountOpts>()
    .parser({ string: ["name"] })
    .ifPositionals("account", "new");
}

export const NewAccountRules: cli.Rule[] = [
  builder()
    .ifOpts(({ help }) => assert.boolean(help).equals(true))
    .then((e) => e.printHelp("new", [], ["name", "type"]))
    .get(),
  builder()
    .ifOpts(({ type }) => assert.string(type).notBlank())
    .ifOpts(({ name }) => assert.string(name).notBlank())
    .thenDo((args) => {
      const opts: NewAccountOpts = args.opts();
      console.log(`Creating a new account: ${opts.name}`);
    })
    .get(),
];
