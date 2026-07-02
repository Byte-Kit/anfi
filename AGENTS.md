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

Deno development scripts:

- `dev:cli`: Execute CLI.
- `test`: Execute test and generate coverage report in `./coverage/`.
- `test:watch`: Execute with hot-reloading support all tests that are modified.
- `coverage`: Print coverate report to CLI.

## Programming Guidelines

### Naming Convention

- Don't use abbreviation.
- Do use concise but full name.
