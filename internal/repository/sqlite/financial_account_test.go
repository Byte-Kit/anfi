package sqlite

import (
	"context"
	"testing"

	"anfi/internal/db"
	"anfi/internal/model"
)

func TestFinancialAccountRepository_CRUD(t *testing.T) {
	ctx := context.Background()
	conn, err := OpenDB(":memory:")
	if err != nil {
		t.Fatalf("failed to open in-memory db: %v", err)
	}
	defer conn.Close()

	if err := db.Migrate(ctx, conn, "../../../migrations"); err != nil {
		t.Fatalf("failed to run migrations: %v", err)
	}

	repo := NewFinancialAccountRepository()

	acc := model.FinancialAccount{
		ID:   "11111111-1111-1111-1111-111111111111",
		Type: model.AccountTypeAsset,
		Name: "Savings",
	}

	if err := repo.Save(ctx, conn, acc); err != nil {
		t.Fatalf("failed to save account: %v", err)
	}

	fetched, err := repo.GetByID(ctx, conn, acc.ID)
	if err != nil {
		t.Fatalf("failed to get account by id: %v", err)
	}
	if fetched == nil || fetched.Name != "Savings" || fetched.Type != model.AccountTypeAsset {
		t.Errorf("unexpected fetched account: %+v", fetched)
	}

	accounts, err := repo.GetAll(ctx, conn)
	if err != nil {
		t.Fatalf("failed to get all accounts: %v", err)
	}
	if len(accounts) != 1 {
		t.Errorf("expected 1 account, got %d", len(accounts))
	}

	rowsDeleted, err := repo.DeleteByIDs(ctx, conn, []string{acc.ID})
	if err != nil {
		t.Fatalf("failed to delete account: %v", err)
	}
	if rowsDeleted != 1 {
		t.Errorf("expected 1 deleted row, got %d", rowsDeleted)
	}
}
