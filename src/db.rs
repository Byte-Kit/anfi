pub trait DbContext {
    type Row;
    type Error: std::error::Error;

    async fn execute(&self, sql: &str) -> Result<(), Self::Error>;
    async fn query(&self, sql: &str) -> Result<Vec<Self::Row>, Self::Error>;
}

pub mod sqlx {
    #[derive(thiserror::Error, Debug)]
    pub enum SqlxError {
        #[error("Unknown database error")]
        Unknown,
    }

    pub struct SqlxSqliteDbContext {
        pool: sqlx::SqlitePool,
    }

    impl SqlxSqliteDbContext {
        fn new(pool: sqlx::SqlitePool) -> Self {
            Self { pool }
        }
    }

    impl super::DbContext for SqlxSqliteDbContext {
        type Error = SqlxError;
        type Row = sqlx::sqlite::SqliteRow;

        async fn execute(&self, sql: &str) -> Result<(), Self::Error> {
            match sqlx::query(sqlx::AssertSqlSafe(sql))
                .execute(&self.pool)
                .await
            {
                Ok(_) => Ok(()),
                Err(_) => Err(SqlxError::Unknown),
            }
        }

        async fn query(&self, sql: &str) -> Result<Vec<Self::Row>, Self::Error> {
            match sqlx::query(sqlx::AssertSqlSafe(sql))
                .fetch_all(&self.pool)
                .await
            {
                Ok(rows) => Ok(rows),
                Err(_) => Err(SqlxError::Unknown),
            }
        }
    }
}
