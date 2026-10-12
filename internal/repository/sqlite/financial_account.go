package sqlite

import (
	"anfi/internal/model"
	"anfi/internal/repository"
	"context"
	"fmt"
)

type sqliteFinancialAccountRepository struct{}

func NewFinancialAccountRepository() repository.FinancialAccountRepository {
	return &sqliteFinancialAccountRepository{}
}

func (r *sqliteFinancialAccountRepository) Save(ctx context.Context, exec repository.DBExecutor, accounts ...model.FinancialAccount) error {
	if len(accounts) == 0 {
		return nil
	}

	query := `
		INSERT INTO financial_account (id, type, name)
		VALUES (?, ?, ?)
		ON CONFLICT(id) DO UPDATE SET
			type = excluded.type,
			name = excluded.name;
	`
	for _, acc := range accounts {
		_, err := exec.ExecContext(ctx, query, acc.ID, string(acc.Type), acc.Name)
		if err != nil {
			return fmt.Errorf("failed to save financial account %s: %w", acc.ID, err)
		}
	}
	return nil
}

func (r *sqliteFinancialAccountRepository) GetAll(ctx context.Context, exec repository.DBExecutor) ([]model.FinancialAccount, error) {
	query := `SELECT id, type, name FROM financial_account`
	rows, err := exec.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []model.FinancialAccount
	for rows.Next() {
		var acc model.FinancialAccount
		var tStr string
		if err := rows.Scan(&acc.ID, &tStr, &acc.Name); err != nil {
			return nil, err
		}
		acc.Type = model.FinancialAccountType(tStr)
		results = append(results, acc)
	}
	return results, rows.Err()
}

func (r *sqliteFinancialAccountRepository) GetByID(ctx context.Context, exec repository.DBExecutor, id string) (*model.FinancialAccount, error) {
	accounts, err := r.GetByIDs(ctx, exec, []string{id})
	if err != nil {
		return nil, err
	}
	if len(accounts) == 0 {
		return nil, nil
	}
	return &accounts[0], nil
}

func (r *sqliteFinancialAccountRepository) GetByIDs(ctx context.Context, exec repository.DBExecutor, ids []string) ([]model.FinancialAccount, error) {
	if len(ids) == 0 {
		return nil, nil
	}

	query := fmt.Sprintf(`SELECT id, type, name FROM financial_account WHERE id IN (%s)`, Placeholders(len(ids)))
	args := make([]any, len(ids))
	for i, id := range ids {
		args[i] = id
	}

	rows, err := exec.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []model.FinancialAccount
	for rows.Next() {
		var acc model.FinancialAccount
		var tStr string
		if err := rows.Scan(&acc.ID, &tStr, &acc.Name); err != nil {
			return nil, err
		}
		acc.Type = model.FinancialAccountType(tStr)
		results = append(results, acc)
	}
	return results, rows.Err()
}

func (r *sqliteFinancialAccountRepository) DeleteByIDs(ctx context.Context, exec repository.DBExecutor, ids []string) (int64, error) {
	if len(ids) == 0 {
		return 0, nil
	}

	query := fmt.Sprintf(`DELETE FROM financial_account WHERE id IN (%s)`, Placeholders(len(ids)))
	args := make([]any, len(ids))
	for i, id := range ids {
		args[i] = id
	}

	res, err := exec.ExecContext(ctx, query, args...)
	if err != nil {
		return 0, err
	}
	return res.RowsAffected()
}
