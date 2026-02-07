import { collect, Collection, Dict } from "@anfi/lib/index.ts";

export enum Key {
  ServerPort,
  DbPath,
  DbMigrationPath,
}

type SourceType = "environment";
type Source = {
  type: SourceType;
  value: string;
};

const CONFIG_SOURCES = new Dict<Key, Collection<Source>>([
  [
    Key.ServerPort,
    collect([
      {
        type: "environment",
        value: "PORT",
      },
    ]),
  ],
  [
    Key.DbPath,
    collect([
      {
        type: "environment",
        value: "DB_PATH",
      },
    ]),
  ],
  [
    Key.DbMigrationPath,
    collect([
      {
        type: "environment",
        value: "DB_MIGRATION_PATH",
      },
    ]),
  ],
]);

export function get(key: Key): string | null {
  const configSource = CONFIG_SOURCES.getValue(key).first();

  if (configSource.type === "environment") {
    return Deno.env.get(configSource.value) ?? null;
  }

  return null;
}
