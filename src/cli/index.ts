import { anfi } from "@anfi/cli/command/index.ts";
import { migrateDb } from "@anfi/cli/init.ts";
import { StringBuilder } from "@anfi/lib/string.ts";
import { ZodError } from "zod";

if (import.meta.main) {
  try {
    await migrateDb();
    await anfi.execute(Deno.args);
  } catch (err) {
    if (err instanceof ZodError) {
      console.error(
        new StringBuilder()
          .a(
            ...err.issues.map(({ path, message }) =>
              new StringBuilder()
                .l(path.join("."))
                .s(4).l(message).get()
            ),
          )
          .get(),
      );
    } else if (err instanceof Error) {
      console.error(err.message, err.stack);
    } else {
      throw err;
    }
  }
}
