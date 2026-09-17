import { FinancialAccountRepository } from "@anfi/model/repository";
import * as schema from "./financial-account.schema.ts";

export class FinancialAccountService {
  #accountRepo: FinancialAccountRepository;

  constructor(accountRepo: FinancialAccountRepository) {
    this.#accountRepo = accountRepo;
  }

  async upsertFinancialAccount(input: schema.UpsertFinancialAccountInput) {
    const dto = schema.UpsertFinancialAccount.parse(input);
    return await this.#accountRepo.saveAsync({
      id: dto.id ?? crypto.randomUUID(),
      type: dto.type,
      name: dto.name,
    });
  }

  async getAllFinancialAccounts(): Promise<schema.FinancialAccount[]> {
    const records = await this.#accountRepo.getAllAsync();
    return records.map((rec) => schema.FinancialAccount.parse(rec));
  }

  async deleteFinancialAccountsByIds(ids: string[]) {
    return await this.#accountRepo.deleteByIdsAsync(ids);
  }
}
