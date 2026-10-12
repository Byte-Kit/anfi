package sqlite

import (
	"context"
	"fmt"
	"anfi/internal/model"
	"anfi/internal/repository"
)

type sqliteFinancialEventRepository struct{}

func NewFinancialEventRepository() repository.FinancialEventRepository {
	return &sqliteFinancialEventRepository{}
}

func (r *sqliteFinancialEventRepository) Save(ctx context.Context, exec repository.DBExecutor, events ...model.FinancialEvent) error {
	if len(events) == 0 {
		return nil
	}

	query := `
		INSERT INTO financial_event (id, timestamp, description)
		VALUES (?, ?, ?)
		ON CONFLICT(id) DO UPDATE SET
			timestamp = excluded.timestamp,
			description = excluded.description;
	`
	for _, ev := range events {
		_, err := exec.ExecContext(ctx, query, ev.ID, ev.Timestamp, ev.Description)
		if err != nil {
			return fmt.Errorf("failed to save financial event %s: %w", ev.ID, err)
		}
	}
	return nil
}

func (r *sqliteFinancialEventRepository) GetAll(ctx context.Context, exec repository.DBExecutor) ([]model.FinancialEvent, error) {
	query := `SELECT id, timestamp, description FROM financial_event`
	rows, err := exec.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []model.FinancialEvent
	for rows.Next() {
		var ev model.FinancialEvent
		if err := rows.Scan(&ev.ID, &ev.Timestamp, &ev.Description); err != nil {
			return nil, err
		}
		results = append(results, ev)
	}
	return results, rows.Err()
}

func (r *sqliteFinancialEventRepository) GetByID(ctx context.Context, exec repository.DBExecutor, id string) (*model.FinancialEvent, error) {
	events, err := r.GetByIDs(ctx, exec, []string{id})
	if err != nil {
		return nil, err
	}
	if len(events) == 0 {
		return nil, nil
	}
	return &events[0], nil
}

func (r *sqliteFinancialEventRepository) GetByIDs(ctx context.Context, exec repository.DBExecutor, ids []string) ([]model.FinancialEvent, error) {
	if len(ids) == 0 {
		return nil, nil
	}

	query := fmt.Sprintf(`SELECT id, timestamp, description FROM financial_event WHERE id IN (%s)`, Placeholders(len(ids)))
	args := make([]any, len(ids))
	for i, id := range ids {
		args[i] = id
	}

	rows, err := exec.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []model.FinancialEvent
	for rows.Next() {
		var ev model.FinancialEvent
		if err := rows.Scan(&ev.ID, &ev.Timestamp, &ev.Description); err != nil {
			return nil, err
		}
		results = append(results, ev)
	}
	return results, rows.Err()
}
