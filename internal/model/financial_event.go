package model

type FinancialEvent struct {
	ID          string `json:"id"`
	Timestamp   int64  `json:"timestamp"`
	Description string `json:"description"`
}
