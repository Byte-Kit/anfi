import { FinancialAccountDao } from "@src/dao";
import * as db from "@src/db";
import * as model from "@src/model";
import * as schema from "./financial-account.schema.ts";

function getDao() {
  return new FinancialAccountDao(db.connect());
}

export function upsertFinancialAccount(dto: schema.UpsertFinancialAccountDto) {
  schema.UpsertFinancialAccountDto.parse(dto);

  const dao = getDao();
  const existingAccount = dto.id ? dao.getById(dto.id) : null;

  if (existingAccount) {
    existingAccount.name = dto.name;
    existingAccount.type = dto.type;
    return dao.save(existingAccount);
  }

  return dao.save(
    new model.FinancialAccount({
      type: dto.type,
      name: dto.name,
    }),
  );
}
