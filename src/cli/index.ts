import { Command, Rules } from "@src/lib/cli.ts";
import { rules } from "./rules/index.ts";

new Command(new Rules(...rules)).run(Deno.args);
