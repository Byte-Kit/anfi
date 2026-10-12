package model

type FinancialTransactionType string

const (
	TransactionTypeCredit FinancialTransactionType = "Credit"
	TransactionTypeDebit  FinancialTransactionType = "Debit"
)

type FinancialTransaction struct {
	ID                 string                   `json:"id"`
	Amount             float64                  `json:"amount"`
	Type               FinancialTransactionType `json:"type"`
	FinancialAccountID string                   `json:"financialAccountId"`
	FinancialEventID   string                   `json:"financialEventId"`
}
