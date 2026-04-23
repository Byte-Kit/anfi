import { StringBuilder } from "@src/lib";
import { ZodError } from "zod";
import { anfi } from "./command/index.ts";

try {
  anfi.execute(Deno.args);
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
