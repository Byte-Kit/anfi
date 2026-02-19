import * as cli from "@std/cli";
import * as db from "@anfi/db/index.ts";
import { collect } from "@anfi/lib/collection.ts";
import { StringBuilder } from "@anfi/lib/string.ts";

const opts = cli.parseArgs(Deno.args);
const args = collect(opts._);

if (args.isEmpty()) {
  console.log(
    new StringBuilder()
      .a("Utility CLI for performing development-related database task").n()
      .n()
      .a("Available commands:").n()
      .s(4).a("init").n()
      .s(4).a("migrate").n()
      .s(4).a("remove").n()
      .s(4).a("reset").n()
      .get(),
  );
}

if (args.first() === "init") {
  db.connect();
}

if (args.first() === "migrate") {
  db.migrate();
}

if (args.first() === "remove") {
  db.removeAsync();
}

if (args.first() === "reset") {
  db.removeAsync().then(() => db.connect());
}
