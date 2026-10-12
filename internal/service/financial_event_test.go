package service

import (
	"context"
	"testing"

	"anfi/internal/db"
	"anfi/internal/repository/sqlite"
)

func TestFinancialEventService_CreateAndList(t *testing.T) {
	ctx := context.Background()
	conn, err := sqlite.OpenDB(":memory:")
	if err != nil {
		t.Fatalf("failed to open in-memory db: %v", err)
	}
	defer conn.Close()

	if err := db.Migrate(ctx, conn, "../../migrations"); err != nil {
		t.Fatalf("failed to migrate: %v", err)
	}

	accountRepo := sqlite.NewFinancialAccountRepository()
	eventRepo := sqlite.NewFinancialEventRepository()
	transactionRepo := sqlite.NewFinancialTransactionRepository()

	accountSvc := NewFinancialAccountService(accountRepo)
	eventSvc := NewFinancialEventService(eventRepo, transactionRepo, accountRepo, conn)

	srcID, err := accountSvc.UpsertFinancialAccount(ctx, conn, UpsertFinancialAccountInput{
		Name: "Salary",
		Type: "Revenue",
	})
	if err != nil {
		t.Fatalf("failed to create account: %v", err)
	}

	targetID, err := accountSvc.UpsertFinancialAccount(ctx, conn, UpsertFinancialAccountInput{
		Name: "Checking",
		Type: "Asset",
	})
	if err != nil {
		t.Fatalf("failed to create account: %v", err)
	}

	err = eventSvc.Create(ctx, CreateFinancialEventInput{
		Description: "Monthly salary",
		Transactions: []CreateTransactionInput{
			{Amount: 1000, Type: "Credit", FinancialAccountID: srcID},
			{Amount: 1000, Type: "Debit", FinancialAccountID: targetID},
		},
	})
	if err != nil {
		t.Fatalf("failed to create financial event: %v", err)
	}

	items, err := eventSvc.List(ctx)
	if err != nil {
		t.Fatalf("failed to list financial events: %v", err)
	}

	if len(items) != 1 {
		t.Fatalf("expected 1 event list item, got %d", len(items))
	}

	item := items[0]
	if item.SourceAccountName != "Salary" || item.TargetAccountName != "Checking" || item.Amount != 1000 || item.Description != "Monthly salary" {
		t.Errorf("unexpected event item values: %+v", item)
	}
}
