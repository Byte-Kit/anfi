pub mod sqlite {
    use sqlx::AssertSqlSafe;

    type SqlitePool = sqlx::Pool<sqlx::Sqlite>;
    type SqliteRow = sqlx::sqlite::SqliteRow;

    #[derive(Debug)]
    pub enum Error {
        Unknown,
    }

    impl std::fmt::Display for Error {
        fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
            write!(f, "Unexpected error occurred")
        }
    }

    impl std::error::Error for Error {}

    pub struct SqliteDbContext {
        pool: SqlitePool,
    }

    impl SqliteDbContext {
        pub fn new(pool: SqlitePool) -> SqliteDbContext {
            SqliteDbContext { pool }
        }

        pub async fn execute<TArg>(&self, sql: &str, args: Vec<TArg>) -> Result<(), Error>
        where
            TArg: for<'a> sqlx::Encode<'a, sqlx::Sqlite> + sqlx::Type<sqlx::Sqlite>,
        {
            let mut query = sqlx::query(AssertSqlSafe(sql));
            for arg in args {
                query = query.bind(arg);
            }

            match query.execute(&self.pool).await {
                Ok(_) => Ok(()),
                Err(_) => Err(Error::Unknown),
            }
        }

        pub async fn query<T, TArg>(&self, sql: &str, args: Vec<TArg>) -> Result<Vec<T>, Error>
        where
            T: for<'a> sqlx::FromRow<'a, SqliteRow> + std::marker::Send + std::marker::Unpin,
            TArg: for<'a> sqlx::Encode<'a, sqlx::Sqlite> + sqlx::Type<sqlx::Sqlite>,
        {
            let mut query = sqlx::query_as(AssertSqlSafe(sql));
            for arg in args {
                query = query.bind(arg);
            }

            match query.fetch_all(&self.pool).await {
                Ok(rows) => Ok(rows),
                Err(_) => Err(Error::Unknown),
            }
        }

        pub async fn close(self) -> () {
            self.pool.close().await;
        }
    }
}

pub trait Repository {
    async fn get_all<T>() -> Vec<T>;
    async fn get_by_id<T>() -> Option<T>;
    async fn get_by_ids<T>() -> Vec<T>;
    async fn delete_by_ids() -> Vec<u32>;
}
