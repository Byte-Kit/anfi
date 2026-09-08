# ANFI

AnFi is a command line program for tracking and managing your spending.

## Usage

```
anfi account new --type Asset 'Checking'
anfi account new --type Asset 'Saving'
anfi account new --type Revenue 'Salary'
anfi account new --type Expense 'Rent'
anfi account new --type Expense 'Grocery'

anfi transaction new --from 'Salary' --to 'Checking' --amount 100
anfi transaction new --from 'Checking' --to 'Rent' --amount 20
anfi transaction new --from 'Checking' --to 'Grocery' --amount 10
anfi transaction new --from 'Checking' --to 'Recreation' --amount 50
anfi transaction new --from 'Asset' --to 'Saving' --amount 20
```
