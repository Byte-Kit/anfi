import { StringBuilder } from "@src/lib";
import * as cli from "@std/cli";

type Consumer<T> = (_: T) => void;

type Arg =
  & Record<string, never>
  & Record<"_", string[]>
  & Record<"help", boolean>
  & Record<"version", boolean>;

type ArgDescriptor = {
  key: string;
  type: "option" | "flag";
  description: string;
  default: unknown;
};

class ArgDescriptorFactory {
  static option(key: string, description: string): ArgDescriptor {
    return {
      key,
      description,
      type: "option",
      default: "",
    };
  }

  static flag(key: string, description: string): ArgDescriptor {
    return {
      key,
      description,
      type: "flag",
      default: false,
    };
  }
}

/**
 * Abstraction over {@link cli.parseArgs}.
 * `help` and `version` are parsed by default.
 *
 * @example
 * ```ts
 * const parser = new Parser({
 *   string: ["name", "type"],
 *   boolean: ["employee"]
 * });
 *
 * const args = parser.parse([
 *   "--employee",
 *   "--name", "Isaac",
 *   "--type", "Contract",
 *   "--version",
 *   "--help"
 * ]);
 *
 * console.log(args.help)     // true
 * console.log(args.version)  // true
 * console.log(args.employee) // true
 * console.log(args.name)     // "Isaac"
 * console.log(args.type)     // "Contract"
 * ```
 */
export class Parser<T extends Arg> {
  private _descriptors: ArgDescriptor[] = [];

  get descriptors() {
    return this._descriptors;
  }

  constructor(descriptors: ArgDescriptor[] = []) {
    this._descriptors = descriptors;
  }

  /**
   * Parse an input array and returns a type-safe arguments object.
   *
   * @param input An array of input.
   * @return A type-safe arguments object.
   */
  parse(input: string[]) {
    const parseOptions: cli.ParseOptions = {
      string: this._descriptors
        .filter((d) => d.type === "option")
        .map((d) => d.key),
      boolean: this._descriptors
        .filter((d) => d.type === "flag")
        .map((d) => d.key),
      default: this._descriptors.reduce<Record<string, unknown>>(
        (mapping, { key, type }) => {
          mapping[key] = type === "option" ? "" : false;
          return mapping;
        },
        {},
      ),
    };
    return cli.parseArgs(input, parseOptions) as T;
  }
}

/**
 * Builder for {@link Parser}.
 *
 * @example
 * ```ts
 * const parser = new ParserBuilder().option("name", {type: "string"}).build();
 * const args = parser.parse(["--name", "Isaac"]);
 * console.log(args.name) // "Isaac"
 * ```
 */
export class ParserBuilder<T extends Arg> {
  private static DEFAULT_DESCRIPTORS: ArgDescriptor[] = [
    ArgDescriptorFactory.flag("help", "Show this message"),
    ArgDescriptorFactory.flag("version", "Show version number"),
  ];

  private _descriptors: ArgDescriptor[] = [];

  option<K extends string>(key: K, description: string = "") {
    this._descriptors.push(
      ArgDescriptorFactory.option(key, description),
    );
    return this as ParserBuilder<T & Record<K, string>>;
  }

  flag<K extends string>(key: K, description: string = "") {
    this._descriptors.push(
      ArgDescriptorFactory.flag(key, description),
    );
    return this as ParserBuilder<T & Record<K, boolean>>;
  }

  build() {
    // Add default descriptors.
    ParserBuilder.DEFAULT_DESCRIPTORS
      .filter(({ key }) => !this._descriptors.some((d) => d.key === key)) // Only add if not already defined.
      .forEach((d) => {
        this._descriptors.push(d);
      });

    return new Parser<T>(this._descriptors);
  }
}

/**
 * Information for a command.
 * Mainly used for printing help message.
 */
type CommandDescriptor = {
  name: string;
  description: string;
  usages: string[];
  options: CommandOptionDescriptor[];
  subCommands: CommandSubCommandDescriptor[];
};
type CommandOptionDescriptor = {
  key: string;
  description: string;
};
type CommandSubCommandDescriptor = {
  name: string;
  description: string;
};

class CommandExecutionContext<T extends Arg> {
  private _input: string[] = [];
  private _args: T;
  private _isDone: boolean = false;

  get input() {
    return this._input;
  }

  get args() {
    return this._args;
  }

  get isDone() {
    return this._isDone;
  }

  constructor(input: string[], args: T) {
    this._input = input;
    this._args = args;
  }

  done(isDone: boolean = true) {
    this._isDone = isDone;
  }
}

type CommandAction<T extends Arg> = Consumer<CommandExecutionContext<T>>;

export class Command<T extends Arg> {
  private _descriptor: CommandDescriptor;
  private _parser: Parser<T>;
  private _preActions: CommandAction<T>[] = [];
  private _actions: CommandAction<T>[] = [];

  get descriptor() {
    return this._descriptor;
  }

  get preActions() {
    return this._preActions;
  }

  get actions() {
    return this._actions;
  }

  constructor(
    descriptor: CommandDescriptor,
    parser: Parser<T>,
    preActions: CommandAction<T>[],
    actions: CommandAction<T>[],
  ) {
    this._descriptor = descriptor;
    this._parser = parser;
    this._preActions = preActions;
    this._actions = actions;
  }

  execute(input: string[]) {
    const args = this._parser.parse(input);
    const execution = new CommandExecutionContext<T>(
      input,
      args,
    );
    this._preActions.concat(this._actions).forEach((action) => {
      if (!execution.isDone) {
        action(execution);
      }
    });
  }
}

class CommandBuilder<T extends Arg> {
  private _parserBuilder: ParserBuilder<T> = new ParserBuilder<T>();

  private _descriptor: CommandDescriptor = {
    name: "",
    description: "",
    options: [],
    subCommands: [],
    usages: [],
  };
  private _preActions: CommandAction<T>[] = [];
  private _actions: CommandAction<T>[] = [];

  name(name: string) {
    this._descriptor.name = name;
    return this;
  }

  description(description: string) {
    this._descriptor.description = description;
    return this;
  }

  option<K extends string>(key: K, description: string = "") {
    this._parserBuilder.option(key, description);
    return this as CommandBuilder<T & Record<K, string>>;
  }

  flag<K extends string>(key: K, description: string = "") {
    this._parserBuilder.flag(key, description);
    return this as CommandBuilder<T & Record<K, boolean>>;
  }

  action(action: CommandAction<T>) {
    this._actions.push(action);
    return this;
  }

  subCommand<TSubcommand extends Arg>(subCommand: Command<TSubcommand>) {
    this._descriptor.subCommands.push({
      name: subCommand.descriptor.name,
      description: subCommand.descriptor.description,
    });

    this._preActions.push(
      (ctx) => {
        const { input, args } = ctx;
        const positionals = args._.join(" ");
        if (positionals.includes(subCommand.descriptor.name)) {
          subCommand.execute(input);
          ctx.done();
        }
      },
    );

    return this;
  }

  build() {
    const parser = this._parserBuilder.build();

    // Option descriptor for help message.
    this._descriptor.options = parser
      .descriptors
      .map<CommandOptionDescriptor>((d) => ({
        key: d.key,
        description: d.description,
      }));

    // Usage descriptor
    this._descriptor.usages = this._descriptor.subCommands.length > 0
      ? ["[OPTIONS] <COMMAND>"]
      : ["[OPTIONS]"];

    this._actions = [
      // If --help=true, print help message.
      (ctx) => {
        const { args } = ctx;
        if (args.help) {
          printHelp(this._descriptor);
          ctx.done();
        }
      },
      ...this._actions,
      // If no processing is done, print help message.
      (ctx) => {
        const { isDone } = ctx;
        if (!isDone) {
          printHelp(this._descriptor);
          ctx.done();
        }
      },
    ];

    return new Command<T>(
      this._descriptor,
      parser,
      this._preActions,
      this._actions,
    );
  }
}

// new CommandBuilder()
//   .name("anfi")
//   .description("Finance management utility.")
//   .subCommand((c) =>
//     c
//       .name("account")
//       .description("Account management.")
//       .subCommand((c) =>
//         c
//           .name("new")
//           .description("Create a new financial account.")
//           .option("name", "The account name")
//           .option("type", "The type of the account")
//           .action((exec) => {
//             exec.done();
//           })
//       )
//   )
//   .build()
//   .execute(Deno.args);

function printHelp(descriptor: CommandDescriptor) {
  const helpBuilder = new StringBuilder();

  if (descriptor.description) {
    helpBuilder.l(descriptor.description).n();
  }

  if (descriptor.name && descriptor.usages) {
    helpBuilder
      .l("Usage")
      .lines(
        descriptor.usages.map((usage) =>
          new StringBuilder().s(4).a(`${descriptor.name} ${usage}`)
            .get()
        ),
      )
      .n();
  }

  if (descriptor.subCommands.length > 0) {
    helpBuilder
      .l("Commands")
      .lines(
        descriptor.subCommands.map(({ name, description }) =>
          new StringBuilder().s(4).a(name.padEnd(24)).a(description).get()
        ),
      )
      .n();
  }

  if (descriptor.options.length > 0) {
    helpBuilder.l("Options");
    helpBuilder.lines(
      descriptor.options.map(({ key, description }) =>
        new StringBuilder().s(4).a(`--${key}`.padEnd(24)).a(description).get()
      ),
    );
  }

  console.log(helpBuilder.get());
}

export function builder() {
  return new CommandBuilder();
}
