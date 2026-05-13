import { FinancialAccountDao } from "@anfi/dao";
import * as model from "@anfi/model";
import * as schema from "./financial-account.schema.ts";
import * as db from "@anfi/db";

export class FinancialAccountService {
  upsertFinancialAccount(input: schema.UpsertFinancialAccountInput) {
    const financialAccountDao = new FinancialAccountDao(
      new db.ConnectionBuilder().get(),
    );

    const dto = schema.UpsertFinancialAccount.parse(input);
    const existingAccount = dto.id ? financialAccountDao.getById(dto.id) : null;

    if (existingAccount) {
      existingAccount.name = dto.name;
      existingAccount.type = dto.type;
      return financialAccountDao.save(existingAccount);
    }

    return financialAccountDao.save(
      new model.FinancialAccount({
        type: dto.type,
        name: dto.name,
      }, dto.id),
    );
  }

  getAllFinancialAccounts(): schema.FinancialAccount[] {
    return new FinancialAccountDao(new db.ConnectionBuilder().get())
      .getAll()
      .map((rec) => schema.FinancialAccount.parse(rec));
  }

  deleteFinancialAccountsByIds(ids: string[]) {
    return new FinancialAccountDao(new db.ConnectionBuilder().get())
      .deleteByIds(ids);
  }
}
