use ::sqlx::FromRow;

use crate::model;

#[derive(thiserror::Error, Debug)]
pub enum Error {
    #[error("Unknown database error")]
    Unknown,
}

pub trait DbContext {
    type Row;
    type Error: std::error::Error;

    async fn execute(&self, sql: &str) -> Result<(), Self::Error>;
    async fn query(&self, sql: &str) -> Result<Vec<Self::Row>, Self::Error>;
    async fn close(self) -> Result<(), Self::Error>;
}

pub mod sqlx {
    pub type SqliteRow = sqlx::sqlite::SqliteRow;

    pub struct SqlxSqliteDbContext {
        pool: sqlx::SqlitePool,
    }

    impl SqlxSqliteDbContext {
        pub fn new(pool: sqlx::SqlitePool) -> Self {
            Self { pool }
        }
    }

    impl super::DbContext for SqlxSqliteDbContext {
        type Row = SqliteRow;
        type Error = super::Error;

        async fn execute(&self, sql: &str) -> Result<(), Self::Error> {
            match sqlx::query(sqlx::AssertSqlSafe(sql))
                .execute(&self.pool)
                .await
            {
                Ok(_) => Ok(()),
                Err(_) => Err(Self::Error::Unknown),
            }
        }

        async fn query(&self, sql: &str) -> Result<Vec<Self::Row>, Self::Error> {
            match sqlx::query(sqlx::AssertSqlSafe(sql))
                .fetch_all(&self.pool)
                .await
            {
                Ok(rows) => Ok(rows),
                Err(_) => Err(Self::Error::Unknown),
            }
        }

        async fn close(self) -> Result<(), Self::Error> {
            Ok(self.pool.close().await)
        }
    }
}

pub struct FinancialAccountRepository<DbContext: self::DbContext> {
    db: DbContext,
}

impl<DbContext: self::DbContext> FinancialAccountRepository<DbContext> {
    pub fn new(db: DbContext) -> Self {
        FinancialAccountRepository { db }
    }
}

impl FinancialAccountRepository<sqlx::SqlxSqliteDbContext> {
    pub async fn get_by_id(&self, id: &str) -> Result<sqlx::SqliteRow, ()> {
        let mut rows = self
            .db
            .query(format!("SELECT * FROM financial_account WHERE id = {id}").as_str())
            .await
            .unwrap();

        let row = rows.remove(0);
        Ok(row)
    }

    pub async fn from_row(row: sqlx::SqliteRow) -> model::FinancialAccount {
        model::FinancialAccount::from_row(&row).unwrap()
    }
}
