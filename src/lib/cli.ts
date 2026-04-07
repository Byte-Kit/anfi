import { StringBuilder } from "@src/lib";
import { equal } from "@std/assert";
import * as cli from "@std/cli";

export type Primitive = string | number | boolean;
export type Func<TIn, TOut> = (input: TIn) => TOut;
export type Predicate<T> = Func<T, boolean>;
export type Consumer<T> = Func<T, void>;

export type PositionalArgumentValue = string | number;
export type OptionValue = Primitive | Primitive[];
export type ParserOptions = cli.ParseOptions;

export interface Opts {
  help: boolean;
  version: boolean;
}

export class Args {
  private _args: cli.Args;

  constructor(input: string[], parseOptions?: ParserOptions) {
    this._args = cli.parseArgs(input, parseOptions ?? {});
  }

  positionals(): PositionalArgumentValue[] {
    return this._args._;
  }

  positional(index: number): PositionalArgumentValue {
    return this.positionals()[index];
  }

  opts<T extends Opts>(): T {
    return this._args as T;
  }
}

export class Rule {
  private _parserOptions: ParserOptions = {};
  private _predicates: Predicate<Args>[] = [];
  private _executor: Consumer<Args>;

  get predicates() {
    return this._predicates;
  }

  get executor() {
    return this._executor;
  }
  set executor(value: Consumer<Args>) {
    this._executor = value;
  }

  get parseOptions() {
    return this._parserOptions;
  }
  set parseOptions(value: ParserOptions) {
    this._parserOptions = value;
  }

  constructor(
    parserOptions: ParserOptions,
    predicates: Predicate<Args>[],
    executor: Consumer<Args>,
  ) {
    this._parserOptions = parserOptions;
    this._predicates = predicates;
    this._executor = executor;
  }

  public isApplicable(input: string[]) {
    const facts = this.parse(input);
    return this._predicates.every((predicate) => predicate(facts));
  }

  public execute(input: string[]) {
    return this._executor(this.parse(input));
  }

  private parse(input: string[]) {
    return new Args(input, this._parserOptions);
  }
}

export class Rules {
  private _rules: Rule[] = [];

  constructor(...rules: Rule[]) {
    this._rules = rules;
  }

  find(input: string[]) {
    return this._rules.find((r) => r.isApplicable(input));
  }
}

export class Command {
  private _rules: Rules;

  public constructor(rules: Rules) {
    this._rules = rules;
  }

  public run(input: string[]) {
    this._rules.find(input)?.execute(input);
  }
}

export class RuleBuilder<T extends Opts> {
  private _rule: Rule = new Rule({}, [], () => {});

  get() {
    return this._rule;
  }

  parser(parserOptions: ParserOptions) {
    this._rule.parseOptions = parserOptions;
    return this;
  }

  if(predicateBuilder: Func<RulePredicateFactory<T>, Predicate<Args>>) {
    this._rule.predicates.push(predicateBuilder(new RulePredicateFactory<T>()));
    return this;
  }

  then(executorBuilder: Func<RuleExecutorFactory<T>, Consumer<Args>>) {
    this._rule.executor = executorBuilder(new RuleExecutorFactory<T>());
    return this;
  }

  ifPositionals(...expected: PositionalArgumentValue[]) {
    return this.if((args) => args.positionals(...expected));
  }

  ifOpts(optPredicate: Predicate<T>) {
    return this.if((args) => args.opts(optPredicate));
  }

  thenDo(executor: Consumer<Args>) {
    return this.then((e) => e.do(executor));
  }
}

export class RulePredicateFactory<T extends Opts> {
  public positionals(...expected: PositionalArgumentValue[]): Predicate<Args> {
    return (args) => equal(args.positionals(), expected);
  }

  public opts(optsPredicate: Predicate<T>): Predicate<Args> {
    return (args) => optsPredicate(args.opts<T>());
  }
}

export class RuleExecutorFactory<T extends Opts> {
  do(cb: Consumer<Args>): Consumer<Args> {
    return (args) => cb(args);
  }

  printHelp(
    commandName: string,
    subCommands: string[] = [],
    options: string[] = [],
  ): Consumer<Args> {
    return this.do(() => {
      const helpBuilder = new StringBuilder().l(commandName).n();

      if (subCommands.length > 0) {
        helpBuilder
          .l("Commands:")
          .lines(
            subCommands.map((subCommand) =>
              new StringBuilder().s(4).a(subCommand).get()
            ),
          )
          .n();
      }

      if (options.length > 0) {
        helpBuilder
          .l("Options:")
          .lines(
            options.map((option) =>
              new StringBuilder().s(4).a("--").a(option).get()
            ),
          );
      }

      console.log(helpBuilder.get());
    });
  }
}
