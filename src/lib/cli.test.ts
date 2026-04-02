import {
  assertArrayIncludes,
  assertEquals,
  assertExists,
  assertFalse,
  assertObjectMatch,
} from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import {
  assertSpyCall,
  assertSpyCallArg,
  assertSpyCalls,
  spy,
  stub,
} from "@std/testing/mock";
import {
  Args,
  Command,
  Opts,
  Rule,
  RuleBuilder,
  RuleExecutorFactory,
  RulePredicateFactory,
  Rules,
} from "./cli.ts";

interface TestCommandOpts extends Opts {
  help: boolean;
  version: boolean;
  opt1: string;
  opt2: boolean;
}

describe("cli", () => {
  describe("Args", () => {
    const args = new Args([
      "arg1",
      "arg2",
      "--opt1=value1",
      "--opt2",
    ]);

    it("positionals() should return an array of positional arguments", () => {
      assertArrayIncludes(args.positionals(), ["arg1", "arg2"]);
    });

    it("positional(index) should the positional argument at the specified index", () => {
      assertEquals(args.positional(0), "arg1");
      assertEquals(args.positional(1), "arg2");
    });

    it("opts() should return an the parsed options", () => {
      assertObjectMatch(args.opts<TestCommandOpts>(), {
        opt1: "value1",
        opt2: true,
      });
    });
  });

  describe("Rule", () => {
    it("isApplicable(input) should checks whether the rule is applicable", () => {
      const rule = new Rule(
        {},
        [
          () => false,
        ],
        () => {},
      );

      assertFalse(rule.isApplicable([]));
    });

    it("execute(input) execute the rule against the provided input", () => {
      const executorSpy = spy((_args: Args) => {});
      const input = ["arg1 --opt1=value1"];

      new Rule(
        {},
        [() => true],
        (args) => executorSpy(args),
      ).execute(input);

      const expectedExecutorArgs = new Args(input);
      assertSpyCall(executorSpy, 0, { args: [expectedExecutorArgs] });
    });
  });

  describe("Rules", () => {
    it("find(input) should return the first applicable rule", () => {
      const falsyRule = new Rule({}, [], () => {});
      const falsyRuleIsApplicable = stub(
        falsyRule,
        "isApplicable",
        () => false,
      );

      const truthyRule = new Rule({}, [], () => {});
      const truthyRuleIsApplicable = stub(
        truthyRule,
        "isApplicable",
        () => true,
      );

      const actual = new Rules(
        falsyRule,
        truthyRule,
      ).find([]);

      assertEquals(falsyRuleIsApplicable.calls.length, 1);
      assertEquals(truthyRuleIsApplicable.calls.length, 1);
      assertEquals(actual, truthyRule);
    });
  });

  describe("Command", () => {
    describe("run(input) should find and excute the first applicable rule", () => {
      const input: string[] = [];

      const rule = new Rule({}, [], () => {});
      const ruleStub = {
        execute: stub(rule, "execute", (_: string[]) => {}),
      };

      const rules = new Rules();
      const rulesStub = {
        find: stub(rules, "find", (_: string[]) => rule),
      };

      new Command(rules).run(input);

      assertSpyCalls(rulesStub.find, 1);
      assertSpyCallArg(rulesStub.find, 0, 0, input);
      assertSpyCalls(ruleStub.execute, 1);
      assertSpyCallArg(ruleStub.execute, 0, 0, input);
    });
  });

  describe("RuleBuilder<T>", () => {
    it("get() should return the built Rule", () => {
      assertExists(new RuleBuilder().get());
    });

    it("if(predicateBuilder) should add a new predicate to the rule being built", () => {
      const predicateSpy = spy((_args: Args) => true);
      const actual = new RuleBuilder<TestCommandOpts>()
        .if(() => predicateSpy)
        .get();
      assertArrayIncludes(actual.predicates, [predicateSpy]);
    });

    it("then(executorBuilder) should set the executor for the rule being built", () => {
      const executorSpy = spy((_args: Args) => {});
      const actual = new RuleBuilder<TestCommandOpts>()
        .then(() => executorSpy)
        .get();
      assertEquals(actual.executor, executorSpy);
    });

    it("ifPositionals(expected) should call if(args => args.positionals(expected))", () => {
      const ruleBuilder = new RuleBuilder<TestCommandOpts>();
      const ruleBuilderSpies = {
        if: spy(ruleBuilder, "if"),
      };

      ruleBuilder.ifPositionals("arg1", "arg2").get();
      assertSpyCalls(ruleBuilderSpies.if, 1);
    });

    it("ifOpts(predicate) should call if(args => args.opts(predicate))", () => {
      const ruleBuilder = new RuleBuilder<TestCommandOpts>();
      const ruleBuilderSpies = {
        if: spy(ruleBuilder, "if"),
      };

      ruleBuilder.ifOpts(() => true).get();
      assertSpyCalls(ruleBuilderSpies.if, 1);
    });

    it("thenDo(callback) should call then(e => e.do(callback))", () => {
      const ruleBuilder = new RuleBuilder<TestCommandOpts>();
      const ruleBuilderSpies = {
        then: spy(ruleBuilder, "then"),
      };

      ruleBuilder.thenDo(() => {}).get();
      assertSpyCalls(ruleBuilderSpies.then, 1);
    });
  });

  describe("RulePredicateFactory", () => {
    const factory = new RulePredicateFactory<TestCommandOpts>();

    it("positionals(...expected) should return a predicate validating the list of positionals", () => {
      const predicate = factory.positionals("arg1", "arg2", "arg3");
      assertEquals(predicate(new Args(["arg1", "arg2", "arg3"])), true);
      assertEquals(predicate(new Args(["arg1", "arg2"])), false);
    });

    it("opts(expected) should return a predicate validating the options", () => {
      const predicate = factory.opts((o) => o.help === true);
      assertEquals(predicate(new Args(["arg1", "--help"])), true);
    });
  });

  describe("RuleExecutorFactory", () => {
    const factory = new RuleExecutorFactory();

    it("printHelp(commandName, subCommands, options) should return a consumer", () => {
      assertExists(factory.printHelp("", [], []));
    });
  });
});
