import { describe, it } from "@std/testing/bdd";
import * as Config from "@anfi/config.ts";
import { assertEquals } from "@std/assert/equals";

describe("config", () => {
  describe("getConfig", () => {
    describe("if first source is environment", () => {
      it("should return the associated environment variable value", () => {
        const keyToEnvVar: [Config.Key, string][] = [
          [Config.Key.ServerPort, "PORT"],
          [Config.Key.DbPath, "DB_PATH"],
          [Config.Key.DbMigrationPath, "DB_MIGRATION_PATH"],
        ];

        keyToEnvVar.forEach((entry) => {
          const [key, envVar] = entry;
          assertEquals(Deno.env.get(envVar), Config.get(key));
        });
      });
    });
  });
});
