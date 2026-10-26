mod db;
mod model;
mod utils;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let db_context =
        db::sqlx::SqlxSqliteDbContext::new(sqlx::SqlitePool::connect("").await.unwrap());

    let financial_account_repo = db::FinancialAccountRepository::new(db_context);
    let financial_account = financial_account_repo.get_by_id("1").await.unwrap();

    todo!()
}
