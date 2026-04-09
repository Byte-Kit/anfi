import { cli, StringBuilder } from "@src/lib";
import { ZodError } from "zod";
import { rules } from "./rules/index.ts";

try {
  new cli.Command(new cli.Rules(...rules)).run(Deno.args);
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
    console.error(err.message);
  } else {
    throw err;
  }
}
