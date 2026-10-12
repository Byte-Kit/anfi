package model

type FinancialAccountType string

const (
	AccountTypeAsset     FinancialAccountType = "Asset"
	AccountTypeLiability FinancialAccountType = "Liability"
	AccountTypeEquity    FinancialAccountType = "Equity"
	AccountTypeRevenue   FinancialAccountType = "Revenue"
	AccountTypeExpense   FinancialAccountType = "Expense"
)

type FinancialAccount struct {
	ID   string               `json:"id"`
	Type FinancialAccountType `json:"type"`
	Name string               `json:"name"`
}
