package model

type BudgetType string

const (
	BudgetTypeCredit BudgetType = "Credit"
	BudgetTypeDebit  BudgetType = "Debit"
)

type Budget struct {
	ID                 string     `json:"id"`
	PeriodStart        int64      `json:"periodStart"`
	PeriodEnd          int64      `json:"periodEnd"`
	Type               BudgetType `json:"type"`
	Amount             float64    `json:"amount"`
	FinancialAccountID string     `json:"financialAccountId"`
}
