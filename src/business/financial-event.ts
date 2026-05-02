import { FinancialEventDao } from "@anfi/dao";
import { BusinessService } from "./common.ts";
import * as schema from "./financial-event.schema.ts";

export class FinancialEventService extends BusinessService {
  create(input: schema.CreateFinancialEventInput) {
    const _financialEventDao = new FinancialEventDao(this.getDbConnection());
    const _dto = schema.CreateFinancialEvent.parse(input);
    throw "not implemented";
  }
}
