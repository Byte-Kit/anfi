package service

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"

	"anfi/internal/model"
	"anfi/internal/repository"
	"anfi/internal/repository/sqlite"
)

type FinancialEventService struct {
	eventRepo       repository.FinancialEventRepository
	transactionRepo repository.FinancialTransactionRepository
	accountRepo     repository.FinancialAccountRepository
	db              *sql.DB
}

func NewFinancialEventService(
	eventRepo repository.FinancialEventRepository,
	transactionRepo repository.FinancialTransactionRepository,
	accountRepo repository.FinancialAccountRepository,
	db *sql.DB,
) *FinancialEventService {
	return &FinancialEventService{
		eventRepo:       eventRepo,
		transactionRepo: transactionRepo,
		accountRepo:     accountRepo,
		db:              db,
	}
}

type CreateFinancialEventInput struct {
	Timestamp    *string
	Description  string
	Transactions []CreateTransactionInput
}

type CreateTransactionInput struct {
	Amount             float64
	Type               string
	FinancialAccountID string
}

type FinancialEventListItem struct {
	Timestamp         string  `json:"timestamp"`
	SourceAccountName string  `json:"sourceAccountName"`
	TargetAccountName string  `json:"targetAccountName"`
	Amount            float64 `json:"amount"`
	Description       string  `json:"description"`
}

func (s *FinancialEventService) List(ctx context.Context) ([]FinancialEventListItem, error) {
	events, err := s.eventRepo.GetAll(ctx, s.db)
	if err != nil {
		return nil, err
	}
	if len(events) == 0 {
		return []FinancialEventListItem{}, nil
	}

	eventIDs := make([]string, len(events))
	for i, e := range events {
		eventIDs[i] = e.ID
	}

	allTransactions, err := s.transactionRepo.GetByFinancialEventIDs(ctx, s.db, eventIDs)
	if err != nil {
		return nil, err
	}

	eventIDToTransactions := make(map[string][]model.FinancialTransaction)
	accountIDSet := make(map[string]bool)
	for _, t := range allTransactions {
		eventIDToTransactions[t.FinancialEventID] = append(eventIDToTransactions[t.FinancialEventID], t)
		accountIDSet[t.FinancialAccountID] = true
	}

	accountIDs := make([]string, 0, len(accountIDSet))
	for id := range accountIDSet {
		accountIDs = append(accountIDs, id)
	}

	accounts, err := s.accountRepo.GetByIDs(ctx, s.db, accountIDs)
	if err != nil {
		return nil, err
	}

	accountIDToAccount := make(map[string]model.FinancialAccount)
	for _, a := range accounts {
		accountIDToAccount[a.ID] = a
	}

	var result []FinancialEventListItem
	for _, event := range events {
		transactions := eventIDToTransactions[event.ID]

		var creditTx *model.FinancialTransaction
		var debitTx *model.FinancialTransaction

		for i := range transactions {
			t := &transactions[i]
			if t.Type == model.TransactionTypeCredit {
				creditTx = t
			} else if t.Type == model.TransactionTypeDebit {
				debitTx = t
			}
		}

		if creditTx == nil || debitTx == nil {
			return nil, errors.New("financial event must have at least one Credit and one Debit transaction")
		}

		creditAccount, ok := accountIDToAccount[creditTx.FinancialAccountID]
		if !ok {
			return nil, fmt.Errorf("credit account not found: %s", creditTx.FinancialAccountID)
		}

		debitAccount, ok := accountIDToAccount[debitTx.FinancialAccountID]
		if !ok {
			return nil, fmt.Errorf("debit account not found: %s", debitTx.FinancialAccountID)
		}

		t := time.Unix(event.Timestamp, 0).UTC().Format(time.RFC3339)

		result = append(result, FinancialEventListItem{
			Timestamp:         t,
			SourceAccountName: creditAccount.Name,
			TargetAccountName: debitAccount.Name,
			Amount:            creditTx.Amount,
			Description:       event.Description,
		})
	}

	return result, nil
}

func (s *FinancialEventService) Create(ctx context.Context, input CreateFinancialEventInput) error {
	if len(input.Transactions) < 2 {
		return errors.New("financial event must have at least two transactions")
	}

	balance := 0.0
	for _, t := range input.Transactions {
		if t.Amount <= 0 {
			return errors.New("transaction amount must be positive")
		}
		txType := model.FinancialTransactionType(t.Type)
		switch txType {
		case model.TransactionTypeDebit:
			balance += t.Amount
		case model.TransactionTypeCredit:
			balance -= t.Amount
		default:
			return fmt.Errorf("invalid transaction type: %s", t.Type)
		}
	}

	if balance != 0 {
		return errors.New("invalid financial event balance")
	}

	var timestamp int64
	if input.Timestamp != nil && *input.Timestamp != "" {
		parsedTime, err := time.Parse(time.RFC3339, *input.Timestamp)
		if err != nil {
			return fmt.Errorf("invalid timestamp format: %w", err)
		}
		timestamp = parsedTime.Unix()
	} else {
		timestamp = time.Now().Unix()
	}

	eventID := uuid.New().String()
	event := model.FinancialEvent{
		ID:          eventID,
		Description: input.Description,
		Timestamp:   timestamp,
	}

	transactions := make([]model.FinancialTransaction, len(input.Transactions))
	for i, t := range input.Transactions {
		transactions[i] = model.FinancialTransaction{
			ID:                 uuid.New().String(),
			Amount:             t.Amount,
			Type:               model.FinancialTransactionType(t.Type),
			FinancialAccountID: t.FinancialAccountID,
			FinancialEventID:   eventID,
		}
	}

	return sqlite.WithTx(ctx, s.db, func(tx *sql.Tx) error {
		if err := s.eventRepo.Save(ctx, tx, event); err != nil {
			return err
		}
		if err := s.transactionRepo.Save(ctx, tx, transactions...); err != nil {
			return err
		}
		return nil
	})
}
