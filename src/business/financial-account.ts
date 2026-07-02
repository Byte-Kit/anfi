import { createSqliteDbContext } from "@anfi/db/context/index.ts";
import * as model from "@anfi/model";
import {
  createFinancialAccountRepository,
  FinancialAccountRepository,
} from "@anfi/model/repository";
import * as schema from "./financial-account.schema.ts";

export class FinancialAccountService {
  #accountRepo: FinancialAccountRepository;

  constructor(accountRepo?: FinancialAccountRepository) {
    this.#accountRepo = accountRepo
      ?? createFinancialAccountRepository(createSqliteDbContext());
  }

  async upsertFinancialAccount(input: schema.UpsertFinancialAccountInput) {
    const dto = schema.UpsertFinancialAccount.parse(input);
    const existingAccount = dto.id
      ? await this.#accountRepo.getByIdAsync(dto.id)
      : null;

    if (existingAccount) {
      existingAccount.name = dto.name;
      existingAccount.type = dto.type;
      return await this.#accountRepo.saveAsync(existingAccount);
    }

    return await this.#accountRepo.saveAsync(
      new model.FinancialAccount({
        type: dto.type,
        name: dto.name,
      }, dto.id),
    );
  }

  async getAllFinancialAccounts(): Promise<schema.FinancialAccount[]> {
    const records = await this.#accountRepo.getAllAsync();
    return records.map((rec) => schema.FinancialAccount.parse(rec));
  }

  async deleteFinancialAccountsByIds(ids: string[]) {
    return await this.#accountRepo.deleteByIdsAsync(ids);
  }
}
