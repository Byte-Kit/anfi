import * as z from "zod";

export const FinancialAccountType = z.enum({
  Asset: 1,
  Liability: 2,
  Equity: 3,
  Revenue: 4,
  Expense: 5,
});
export type FinancialAccountType = z.infer<typeof FinancialAccountType>;

export const UpsertFinancialAccountDto = z.object({
  id: z.string().nullable(),
  name: z.string(),
  type: FinancialAccountType,
});
export type UpsertFinancialAccountDto = z.infer<
  typeof UpsertFinancialAccountDto
>;
