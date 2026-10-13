use uuid::Uuid;

#[derive(Debug, Clone, Copy, PartialEq, Eq, sqlx::Type)]
pub enum AccountType {
    Asset,
    Liability,
    Equity,
    Revenue,
    Expense,
}

impl AccountType {
    pub fn as_str(&self) -> &'static str {
        match &self {
            Self::Asset => "Asset",
            Self::Liability => "Liability",
            Self::Equity => "Equity",
            Self::Revenue => "Revenue",
            Self::Expense => "Expense",
        }
    }
}

impl TryFrom<&str> for AccountType {
    type Error = &'static str;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        match value.to_lowercase().as_str() {
            "asset" => Ok(Self::Asset),
            "liability" => Ok(Self::Liability),
            "equity" => Ok(Self::Equity),
            "revenue" => Ok(Self::Revenue),
            "expense" => Ok(Self::Expense),
            _ => Err(
                "Unable to parse account type. Expected 'Asset', 'Liability', 'Equity', 'Revenue' or 'Expense'.",
            ),
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, sqlx::Type)]
pub enum TransactionType {
    Credit,
    Debit,
}

impl TryFrom<&str> for TransactionType {
    type Error = &'static str;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        match value.to_lowercase().as_str() {
            "credit" => Ok(Self::Credit),
            "debit" => Ok(Self::Debit),
            _ => Err("Unable to parse transaction type. Expected 'Credit' or 'Debit'"),
        }
    }
}

impl TransactionType {
    pub fn as_str(&self) -> &'static str {
        match &self {
            Self::Credit => "Credit",
            Self::Debit => "Debit",
        }
    }
}

#[derive(Debug, PartialEq, Eq, sqlx::FromRow)]
pub struct FinancialAccount {
    pub id: Uuid,
    pub name: String,
    pub account_type: AccountType,
}

#[derive(Debug, PartialEq, Eq, sqlx::FromRow)]
pub struct FinancialEvent {
    pub id: Uuid,
    pub timestamp: i64,
    pub description: String,
}

#[derive(Debug, PartialEq, sqlx::FromRow)]
pub struct FinancialTransaction {
    pub id: Uuid,
    pub amount: f64,
    pub transaction_type: TransactionType,
    pub financial_account_id: Uuid,
    pub financial_event_id: Uuid,
}
