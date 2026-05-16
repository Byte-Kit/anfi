# ANFI — Agent Guide

Finance tracking & budgeting CLI.

Deno 2.x project (no `node_modules`).

## Architecture

- `src/cli/`: CLI implementation.
- `src/business/`: Shared business logic.
- `src/dao/`: Database access layer.
- `src/model/`: Business entities.
- `src/db/`: Low-level database layer.
- `src/lib/`: Shared utilities and libraries.
- `src/config.ts`: Defines solution parameters and config sources.

## Programming Guidelines

### Naming Convention

- Don't use abbreviation.
- Do use concise but full name.
