import { join, resolve } from "@std/path";

export function resolvePath(path: string) {
  if (path.startsWith("~")) {
    const home = Deno.env.get("HOME");
    if (home == null) {
      throw new Error("Could not locate the home directory");
    }

    return resolve(join(home, path.slice(1)));
  }

  return resolve(path);
}
