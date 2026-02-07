BEGIN TRANSACTION;
DROP TABLE IF EXISTS "budget";
DROP TABLE IF EXISTS "transaction";
DROP TABLE IF EXISTS "financial_event";
DROP TABLE IF EXISTS "financial_account";
DROP TABLE IF EXISTS "_migration";
DELETE FROM "_migration" WHERE name = '1756645609-initial-migration';
COMMIT;
