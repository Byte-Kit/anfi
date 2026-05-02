import { FinancialAccountDao } from "@anfi/dao";
import * as model from "@anfi/model";
import { BusinessService } from "./common.ts";
import * as schema from "./financial-account.schema.ts";

export class FinancialAccountService extends BusinessService {
  upsertFinancialAccount(input: schema.UpsertFinancialAccountInput) {
    const financialAccountDao = new FinancialAccountDao(
      this.getDbConnection(),
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
    return new FinancialAccountDao(this.getDbConnection())
      .getAll()
      .map((rec) => schema.FinancialAccount.parse(rec));
  }

  deleteFinancialAccountsByIds(ids: string[]) {
    return new FinancialAccountDao(this.getDbConnection()).deleteByIds(ids);
  }
}
