package sqlite

import (
	"context"
	"fmt"
	"anfi/internal/model"
	"anfi/internal/repository"
)

type sqliteFinancialTransactionRepository struct{}

func NewFinancialTransactionRepository() repository.FinancialTransactionRepository {
	return &sqliteFinancialTransactionRepository{}
}

func (r *sqliteFinancialTransactionRepository) Save(ctx context.Context, exec repository.DBExecutor, transactions ...model.FinancialTransaction) error {
	if len(transactions) == 0 {
		return nil
	}

	query := `
		INSERT INTO financial_transaction (id, financial_account_id, financial_event_id, amount, type)
		VALUES (?, ?, ?, ?, ?)
		ON CONFLICT(id) DO UPDATE SET
			financial_account_id = excluded.financial_account_id,
			financial_event_id = excluded.financial_event_id,
			amount = excluded.amount,
			type = excluded.type;
	`
	for _, tx := range transactions {
		_, err := exec.ExecContext(ctx, query, tx.ID, tx.FinancialAccountID, tx.FinancialEventID, tx.Amount, string(tx.Type))
		if err != nil {
			return fmt.Errorf("failed to save financial transaction %s: %w", tx.ID, err)
		}
	}
	return nil
}

func (r *sqliteFinancialTransactionRepository) GetAll(ctx context.Context, exec repository.DBExecutor) ([]model.FinancialTransaction, error) {
	query := `SELECT id, financial_account_id, financial_event_id, amount, type FROM financial_transaction`
	rows, err := exec.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []model.FinancialTransaction
	for rows.Next() {
		var tx model.FinancialTransaction
		var tStr string
		if err := rows.Scan(&tx.ID, &tx.FinancialAccountID, &tx.FinancialEventID, &tx.Amount, &tStr); err != nil {
			return nil, err
		}
		tx.Type = model.FinancialTransactionType(tStr)
		results = append(results, tx)
	}
	return results, rows.Err()
}

func (r *sqliteFinancialTransactionRepository) GetByFinancialEventIDs(ctx context.Context, exec repository.DBExecutor, eventIDs []string) ([]model.FinancialTransaction, error) {
	if len(eventIDs) == 0 {
		return nil, nil
	}

	query := fmt.Sprintf(`SELECT id, financial_account_id, financial_event_id, amount, type FROM financial_transaction WHERE financial_event_id IN (%s)`, Placeholders(len(eventIDs)))
	args := make([]any, len(eventIDs))
	for i, id := range eventIDs {
		args[i] = id
	}

	rows, err := exec.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []model.FinancialTransaction
	for rows.Next() {
		var tx model.FinancialTransaction
		var tStr string
		if err := rows.Scan(&tx.ID, &tx.FinancialAccountID, &tx.FinancialEventID, &tx.Amount, &tStr); err != nil {
			return nil, err
		}
		tx.Type = model.FinancialTransactionType(tStr)
		results = append(results, tx)
	}
	return results, rows.Err()
}
