# ANFI (Go Port)

AnFi is a command line program and domain model backend for tracking and managing spending using double-entry bookkeeping.

## Project Structure (Go)

- `internal/model/`: Domain entities (`FinancialAccount`, `FinancialEvent`, `FinancialTransaction`, `Budget`) with correct naming and types.
- `internal/repository/`: Repository interfaces (`FinancialAccountRepository`, `FinancialEventRepository`, `FinancialTransactionRepository`) and their SQLite implementations using `database/sql` and `modernc.org/sqlite`.
- `internal/db/`: Migration runner executing SQL migration files (`up.sql`) against the database.
- `internal/service/`: Business services (`FinancialAccountService`, `FinancialEventService`) handling account upserts, listing, and double-entry balance validation ($\sum \text{Debits} - \sum \text{Credits} = 0$).
- `migrations/`: Preserved SQL migration files.

## Running Tests

```sh
go test -v ./...
```
