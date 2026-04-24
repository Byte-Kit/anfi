import { FinancialAccountDao } from "@anfi/dao";
import * as db from "@anfi/db";
import * as model from "@anfi/model";
import * as schema from "./financial-account.schema.ts";
import { DbService } from "./common.ts";

export class FinancialAccountService implements DbService {
  private _financialAccountDao = new FinancialAccountDao(
    this.getDbConnection(),
  );

  getDbConnection() {
    return new db.ConnectionBuilder().get();
  }

  upsertFinancialAccount(input: Record<string, unknown>) {
    const dto = schema.UpsertFinancialAccount.parse(input);

    const existingAccount = dto.id
      ? this._financialAccountDao.getById(dto.id)
      : null;

    if (existingAccount) {
      existingAccount.name = dto.name;
      existingAccount.type = dto.type;
      return this._financialAccountDao.save(existingAccount);
    }

    return this._financialAccountDao.save(
      new model.FinancialAccount({
        type: dto.type,
        name: dto.name,
      }, dto.id),
    );
  }

  listFinancialAccounts(): schema.FinancialAccount[] {
    return this._financialAccountDao.getAll().map((rec) =>
      schema.FinancialAccount.parse(rec)
    );
  }

  deleteFinancialAccountByIds(ids: string[]) {
    return this._financialAccountDao.deleteByIds(ids);
  }
}
