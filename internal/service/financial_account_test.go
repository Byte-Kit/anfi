package service

import (
	"context"
	"testing"

	"anfi/internal/model"
	"anfi/internal/repository"
)

type mockAccountRepo struct {
	repository.FinancialAccountRepository
	savedAccounts []model.FinancialAccount
}

func (m *mockAccountRepo) Save(ctx context.Context, exec repository.DBExecutor, accounts ...model.FinancialAccount) error {
	m.savedAccounts = append(m.savedAccounts, accounts...)
	return nil
}

func (m *mockAccountRepo) GetAll(ctx context.Context, exec repository.DBExecutor) ([]model.FinancialAccount, error) {
	return m.savedAccounts, nil
}

func TestUpsertFinancialAccount_Validation(t *testing.T) {
	repo := &mockAccountRepo{}
	svc := NewFinancialAccountService(repo)
	ctx := context.Background()

	// Empty name
	_, err := svc.UpsertFinancialAccount(ctx, nil, UpsertFinancialAccountInput{
		Name: "",
		Type: "Asset",
	})
	if err == nil {
		t.Error("expected error for empty name, got nil")
	}

	// Invalid type
	_, err = svc.UpsertFinancialAccount(ctx, nil, UpsertFinancialAccountInput{
		Name: "Checking",
		Type: "InvalidType",
	})
	if err == nil {
		t.Error("expected error for invalid type, got nil")
	}

	// Valid input
	id, err := svc.UpsertFinancialAccount(ctx, nil, UpsertFinancialAccountInput{
		Name: "Checking",
		Type: "Asset",
	})
	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}
	if id == "" {
		t.Error("expected non-empty uuid id")
	}
}
