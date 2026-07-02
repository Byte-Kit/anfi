import * as stdPath from "@std/path";

export function resolvePath(path: string) {
  if (path.startsWith("~")) {
    const home = Deno.env.get("HOME");
    if (home == null) {
      throw new Error("Could not locate the home directory");
    }

    return stdPath.resolve(stdPath.join(home, path.slice(1)));
  }

  return stdPath.resolve(path);
}

export * from "@std/path";
