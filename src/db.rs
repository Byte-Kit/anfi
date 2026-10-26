pub mod core {
    pub enum Arg {
        Boolean(bool),
        Floating64(f64),
        Integer32(i32),
        Integer64(i64),
        String(String),
    }

    pub trait Repository {
        type Row;
        type Error;

        async fn query_row(&self, sql: &str, args: Vec<Arg>) -> Result<Self::Row, Self::Error>;
    }
}

pub mod sqlx {
    use super::core::{Arg, Repository};
    use sqlx::{
        Arguments, AssertSqlSafe, Error, query_with,
        sqlite::{SqliteArguments, SqlitePool, SqliteRow},
    };

    fn build_sqlite_args(args: Vec<Arg>) -> SqliteArguments {
        let mut sqlite_args = SqliteArguments::default();
        for arg in args {
            match arg {
                Arg::String(arg_value) => sqlite_args.add(arg_value),
                Arg::Integer32(arg_value) => sqlite_args.add(arg_value),
                Arg::Floating64(arg_value) => sqlite_args.add(arg_value),
                Arg::Boolean(arg_value) => sqlite_args.add(arg_value),
                Arg::Integer64(arg_value) => sqlite_args.add(arg_value),
            };
        }
        sqlite_args
    }

    pub struct SqliteRepository {
        pool: SqlitePool,
    }

    impl SqliteRepository {
        pub fn new(pool: SqlitePool) -> Self {
            Self { pool }
        }
    }

    impl Repository for SqliteRepository {
        type Row = SqliteRow;
        type Error = Error;

        async fn query_row(&self, sql: &str, args: Vec<Arg>) -> Result<Self::Row, Self::Error> {
            query_with(AssertSqlSafe(sql), build_sqlite_args(args))
                .fetch_one(&self.pool)
                .await
        }
    }
}
