# ANFI — Agent Guide

Finance tracking & budgeting CLI.

Deno 2.x project (no `node_modules`).

## Architecture

- `src/cli/`: CLI implementation.
- `src/business/`: Shared business logic.
- `src/model/repository/`: Data access via generic repository pattern.
- `src/model/`: Business entities.
- `src/db/`: Low-level database layer.
- `src/lib/`: Shared utilities and libraries.
- `src/config.ts`: Defines solution parameters and config sources.

Additionally, refer to `.gitignore` for the list of ignored files and directories.

## Scripts & Commands

Deno development tasks:

- `dev:cli`: Execute CLI.
- `dev:tui`: Execute TUI (Terminal User Interface).
- `test`: Execute tests with coverage.
- `test:watch`: Run tests in watch mode with hot-reloading.
- `coverage`: Print coverage report (excludes `model` and `db` paths).
- `db:clean`: Clean the database.
- `db:migrate`: Run database migrations.
- `db:reset`: Clean and re-run all database migrations.
- `build:cli`: Compile CLI to a standalone executable at `./build/anfi`.

### Verification

Always run the CI tasks to verify code quality and correctness after making any modifications:

- `ci:lint`: Run Deno linter.
- `ci:fmt`: Check code formatting under `src/`.
- `ci:check`: Type-check the project.
- `ci`: Run the full verification suite (runs `ci:fmt`, `ci:lint`, `ci:check`, `test`, and generates a coverage report).

## Programming Guidelines

### Naming Convention

- Don't use abbreviation.
- Do use concise but full name.
