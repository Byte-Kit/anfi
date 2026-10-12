package repository

import (
	"anfi/internal/model"
	"context"
	"database/sql"
)

type DBExecutor interface {
	ExecContext(ctx context.Context, query string, args ...any) (sql.Result, error)
	QueryContext(ctx context.Context, query string, args ...any) (*sql.Rows, error)
	QueryRowContext(ctx context.Context, query string, args ...any) *sql.Row
}

type FinancialAccountRepository interface {
	Save(ctx context.Context, exec DBExecutor, accounts ...model.FinancialAccount) error
	GetAll(ctx context.Context, exec DBExecutor) ([]model.FinancialAccount, error)
	GetByID(ctx context.Context, exec DBExecutor, id string) (*model.FinancialAccount, error)
	GetByIDs(ctx context.Context, exec DBExecutor, ids []string) ([]model.FinancialAccount, error)
	DeleteByIDs(ctx context.Context, exec DBExecutor, ids []string) (int64, error)
}

type FinancialEventRepository interface {
	Save(ctx context.Context, exec DBExecutor, events ...model.FinancialEvent) error
	GetAll(ctx context.Context, exec DBExecutor) ([]model.FinancialEvent, error)
	GetByID(ctx context.Context, exec DBExecutor, id string) (*model.FinancialEvent, error)
	GetByIDs(ctx context.Context, exec DBExecutor, ids []string) ([]model.FinancialEvent, error)
}

type FinancialTransactionRepository interface {
	Save(ctx context.Context, exec DBExecutor, transactions ...model.FinancialTransaction) error
	GetAll(ctx context.Context, exec DBExecutor) ([]model.FinancialTransaction, error)
	GetByFinancialEventIDs(ctx context.Context, exec DBExecutor, eventIDs []string) ([]model.FinancialTransaction, error)
}
