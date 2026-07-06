# ANFI — Agent Guide

Finance tracking & budgeting CLI.

Deno 2.x project (no `node_modules`). SQLite via `node:sqlite` (wrapped in a sync-to-async `DbContext`).

## Architecture

- `src/cli/`: CLI implementation (uses a custom CLI framework in `src/lib/cli.ts`, not a third-party lib).
- `src/business/`: Service classes with Zod schema validation (parse-don't-validate pattern).
- `src/model/`: Type aliases for entities (`FinancialAccount`, `FinancialEvent`, `FinancialTransaction`, `Budget`).
- `src/model/repository/`: Generic repository factory generating parameterized SQL (upsert, select, delete by ID).
- `src/db/`: `DbContext` interface + SQLite implementation + migration runner.
- `src/lib/`: Shared utilities (Chrono datetime, Collection, Dict, StringBuilder, CLI framework helpers).

Module aliases (from `deno.json` imports): `@anfi/` → `./src/`, plus named aliases for `@anfi/business`, `@anfi/db`, `@anfi/lib`, `@anfi/model`, `@anfi/model/repository`.

Budget and standalone transaction logic are stubs (`src/business/budget.ts`, `src/business/transaction.ts` are empty).

## Setup & Environment

No config file. Configure via env vars loaded from `.env` (cli) or `.env.test` (tests) using `--env-file`:

- `DB_PATH` — SQLite db file path (default `./output/eada.db`)
- `DB_MIGRATION_PATH` — migrations directory (default `./migrations/`)

Migrations are subdirectories under `migrations/` alphanumerically sorted, each containing `up.sql` and `down.sql`.

## Scripts & Commands

```sh
deno task dev:cli          # Run CLI
deno task test             # Run tests with coverage (uses --env-file=.env.test)
deno task test:watch       # Tests in watch mode
deno task coverage         # Coverage report (excludes model/ and db/ paths)
deno task db:migrate       # Run pending migrations
deno task db:clean         # Remove the SQLite DB file
deno task db:reset         # Clean + migrate (no &&, uses ; — ignore clean failure)
deno task build:cli        # Compile standalone CLI to ./build/anfi
```

### Verification (run these after any change)

```sh
deno task ci:fmt     # deno fmt --check src/
deno task ci:lint    # deno lint (includes react ruleset)
deno task ci:check   # deno check (type-check)
deno task ci         # Full suite: fmt → lint → check → test → coverage (parallel deps)
```

## Testing Patterns

- **Business services** use mocked repositories (`@std/testing/mock` spy/stub) — no real DB.
- **Repositories** use real in-memory SQLite (`DbContext` created without a path).
- **Utilities** are pure unit tests.
- Framework: `@std/testing/bdd` (`describe`/`it`/`beforeEach`).

## Conventions

- Formatting: `operatorPosition: "nextLine"` (enforced by `ci:fmt`).
- Naming: no abbreviations, concise but full names.
- IDs: `crypto.randomUUID()`.
- `FinancialEventService.create()` enforces double-entry bookkeeping (debits + credits sum to zero).
- Repositories use upsert pattern: `INSERT ... ON CONFLICT(id) DO UPDATE SET ...`.
- The `down.sql` in the initial migration has a typo: it drops `"transaction"` instead of `"financial_transaction"`.
