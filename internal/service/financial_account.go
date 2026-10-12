package service

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/google/uuid"

	"anfi/internal/model"
	"anfi/internal/repository"
)

type FinancialAccountService struct {
	accountRepo repository.FinancialAccountRepository
}

func NewFinancialAccountService(accountRepo repository.FinancialAccountRepository) *FinancialAccountService {
	return &FinancialAccountService{
		accountRepo: accountRepo,
	}
}

type UpsertFinancialAccountInput struct {
	ID   *string
	Name string
	Type string
}

func (s *FinancialAccountService) UpsertFinancialAccount(ctx context.Context, exec repository.DBExecutor, input UpsertFinancialAccountInput) (string, error) {
	name := strings.TrimSpace(input.Name)
	if name == "" {
		return "", errors.New("account name cannot be empty")
	}

	accType := model.FinancialAccountType(input.Type)
	switch accType {
	case model.AccountTypeAsset, model.AccountTypeLiability, model.AccountTypeEquity, model.AccountTypeRevenue, model.AccountTypeExpense:
		// valid
	default:
		return "", fmt.Errorf("invalid financial account type: %s", input.Type)
	}

	id := ""
	if input.ID != nil && *input.ID != "" {
		parsed, err := uuid.Parse(*input.ID)
		if err != nil {
			return "", fmt.Errorf("invalid uuid: %w", err)
		}
		id = parsed.String()
	} else {
		id = uuid.New().String()
	}

	account := model.FinancialAccount{
		ID:   id,
		Type: accType,
		Name: name,
	}

	if err := s.accountRepo.Save(ctx, exec, account); err != nil {
		return "", err
	}

	return id, nil
}

func (s *FinancialAccountService) GetAllFinancialAccounts(ctx context.Context, exec repository.DBExecutor) ([]model.FinancialAccount, error) {
	return s.accountRepo.GetAll(ctx, exec)
}

func (s *FinancialAccountService) DeleteFinancialAccountsByIds(ctx context.Context, exec repository.DBExecutor, ids []string) (int64, error) {
	return s.accountRepo.DeleteByIDs(ctx, exec, ids)
}
