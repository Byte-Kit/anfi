# Design

This is the central design document for AnFi.

## Use Cases

```mermaid
---
title: Use Cases
---
flowchart LR
    user[User]

    subgraph anfi [AnFi]
        account_management[Account Management]
        budget_management[Budget Management]
        post_transaction[Post transactions]
        metrics[Metrics]
    end

    user --> account_management
    user --> budget_management
    user --> post_transaction
    user --> metrics
```

## Logical Data Models

```mermaid
erDiagram
    financial_account
    financial_event
    financial_transaction

    financial_event }o--|| financial_account: "belongs to"
    financial_event ||--|{ financial_transaction: "has one or more"
    financial_transaction }o--|| financial_account: "from one"
    financial_transaction }o--|| financial_account: "to another"

    budget
    budget_period

    financial_account ||--o{ budget: ""
    budget ||--o{ budget_period: ""
```

### financial_account

| Attribute | Type | Required | Description                                                                          |
| --------- | ---- | -------- | ------------------------------------------------------------------------------------ |
| id        | TEXT | x        | PK                                                                                   |
| type      | TEXT | x        | Allowed values:<br>1. Asset<br>2. Liability<br>3. Equity<br>4. Revenue<br>5. Expense |
| name      | TEXT | x        | Unique                                                                               |

### financial_transaction

| Attribute            | Type   | Required | Description                            |
| -------------------- | ------ | -------- | -------------------------------------- |
| id                   | TEXT   | x        | PK                                     |
| amount               | NUMBER | x        |                                        |
| type                 | TEXT   | x        | Allowed values:<br>- Credit<br>- Debit |
| financial_account_id | TEXT   | x        | FK -> `financial_account.id`           |
| financial_event_id   | TEXT   | x        | FK -> `financial_event.id`             |

### financial_event

| Attribute   | Type   | Required | Description |
| ----------- | ------ | -------- | ----------- |
| id          | TEXT   | x        | PK          |
| timestamp   | NUMBER | x        |             |
| description | TEXT   | x        |             |

### budget

| Attribute            | Type | Required | Description                            |
| -------------------- | ---- | -------- | -------------------------------------- |
| id                   | TEXT | x        | PK                                     |
| financial_account_id | TEXT | x        | FK -> `financial_account.id`           |
| type                 | TEXT | x        | Allowed values:<br>- Credit<br>- Debit |

### budget_period

| Attribute | Type   | Required | Description       |
| --------- | ------ | -------- | ----------------- |
| id        | TEXT   | x        | PK                |
| budget_id | TEXT   | x        | FK -> `budget.id` |
| start     | NUMBER | x        |                   |
| end       | NUMBER | x        |                   |
| amount    | NUMBER | x        |                   |
