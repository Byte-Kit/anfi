BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS "_migration" (
  "name" TEXT NOT NULL,
  PRIMARY KEY("name")
);

CREATE TABLE IF NOT EXISTS "financial_account" (
  "id"   TEXT     NOT NULL,
  "type" INTEGER  NOT NULL,
  "name" TEXT     NOT NULL,

  PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "financial_event" (
  "id"          TEXT     NOT NULL,
  "timestamp"   INTEGER  NOT NULL,
  "description" TEXT     NOT NULL,

  PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "transaction" (
  "id"                    TEXT      NOT NULL,
  "financial_account_id"  TEXT      NOT NULL,
  "financial_event_id"    TEXT      NOT NULL,
  "amount"                REAL      NOT NULL,
  "type"                  TEXT      NOT NULL,

  PRIMARY KEY("id"),
  FOREIGN KEY("financial_account_id") REFERENCES "financial_account"("id")
  FOREIGN KEY("financial_event_id") REFERENCES "financial_event"("id")
);

CREATE TABLE IF NOT EXISTS "budget" (
  "id"                   TEXT      NOT NULL,
  "financial_account_id" TEXT      NOT NULL,
  "period_start"         INTEGER   NOT NULL,
  "period_end"           INTEGER   NOT NULL,
  "type"                 TEXT      NOT NULL,
  "amount"               REAL      NOT NULL,

  PRIMARY KEY("id")
  FOREIGN KEY("financial_account_id") REFERENCES "financial_account"("id")
  UNIQUE("period_start", "period_end","financial_account_id")
);

INSERT OR IGNORE INTO "_migration" VALUES ('1756645609-initial-migration');
COMMIT;
