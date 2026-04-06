import * as z from "zod";

export const FinancialAccountType = z.enum([
  "Asset",
  "Liability",
  "Equity",
  "Revenue",
  "Expense",
]);
export type FinancialAccountType = z.infer<typeof FinancialAccountType>;

export const FinancialAccountTypeCode = FinancialAccountType.transform(
  (value) => {
    if (value === "Asset") return 1;
    else if (value === "Liability") return 2;
    else if (value === "Equity") return 3;
    else if (value === "Revenue") return 4;
    else return 5;
  },
);
export type FinancialAccountTypeCode = z.infer<typeof FinancialAccountTypeCode>;

export const UpsertFinancialAccountDto = z.object({
  id: z.string().nullable(),
  name: z.string(),
  type: FinancialAccountTypeCode,
});
export type UpsertFinancialAccountDto = z.infer<
  typeof UpsertFinancialAccountDto
>;
