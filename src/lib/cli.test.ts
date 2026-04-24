import { cli } from "@anfi/lib";
import { ParserBuilder } from "@anfi/lib/cli.ts";
import {
  assert,
  assertArrayIncludes,
  assertEquals,
  assertFalse,
} from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { assertSpyCalls, stub } from "@std/testing/mock";

describe("cli", () => {
  describe("ArgsDescriptor", () => {
    it("optionFrom(key, description) should return a new option descriptor", () => {
      const actual = cli.ArgsDescriptor.optionFrom(
        "name",
        "Name of a person.",
      );

      assertEquals(actual.key, "name");
      assertEquals(actual.description, "Name of a person.");
      assertEquals(actual.type, cli.ArgsDescriptorType.Option);
      assertEquals(actual.defaultValue, "");
      assert(actual.isOption());
    });

    it("flagFrom(key, description) should return a new flag descriptor", () => {
      const actual = cli.ArgsDescriptor.flagFrom(
        "help",
        "Show help message.",
      );

      assertEquals(actual.key, "help");
      assertEquals(actual.description, "Show help message.");
      assertEquals(actual.type, cli.ArgsDescriptorType.Flag);
      assertEquals(actual.defaultValue, false);
      assert(actual.isFlag());
    });
  });

  describe("ParserBuilder", () => {
    it("should build a type-safe arguments parser", () => {
      const parser = new ParserBuilder()
        .option("name", "Name of a person")
        .flag("children", "Indicates whether a person is a child")
        .build();

      const actual = parser.parse([
        "positional_1",
        "positional_2",
        "--name",
        "Isaac",
        "--children",
      ]);

      assertFalse(actual.help);
      assertFalse(actual.version);
      assert(actual.children);
      assertEquals(actual.name, "Isaac");
      assertArrayIncludes(actual["_"] as string[], [
        "positional_1",
        "positional_2",
      ]);
    });
  });

  describe("CommandBuilder", () => {
    it("build() should build a valid Command", () => {
      let isChildren = false;
      let actualName = "";

      const command = cli.builder()
        .name("anfi")
        .description("Financial utilities.")
        .option("name", "Name of a person.")
        .flag("children", "Indicates whether a person is a child.")
        .action((exec) => {
          const { args } = exec;
          isChildren = args.children;
          actualName = args.name;
          exec.done();
        })
        .build();

      command.execute(["--children", "--name", "Isaac"]);

      assertEquals(command.descriptor.name, "anfi");
      assertEquals(command.descriptor.description, "Financial utilities.");
      assert(isChildren);
      assertEquals(actualName, "Isaac");
    });

    it("should support sub-command", () => {
      const subCommand = cli
        .builder()
        .name("account")
        .action((exec) => exec.done())
        .build();
      const subCommandExecStub = stub(subCommand, "execute", () => {});
      const command = cli.builder()
        .name("anfi")
        .subCommand(subCommand)
        .build();

      command.execute(["account"]);
      assertSpyCalls(subCommandExecStub, 1);
    });
  });
});
