mod db;
mod model;
mod utils;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let db_context = db::sqlite::SqliteDbContext::new(sqlx::SqlitePool::connect("").await.unwrap());
    let rows: Vec<model::FinancialAccount> = db_context
        .query("SELECT * FROM financial_account WHERE id=?", vec!["1"])
        .await?;
    db_context.close().await;

    todo!()
}
