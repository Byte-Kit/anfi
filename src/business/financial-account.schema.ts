import * as z from "zod";

export const FinancialAccountType = z.enum([
  "Asset",
  "Liability",
  "Equity",
  "Revenue",
  "Expense",
]);
export const FinancialAccountTypeCode = z.enum({
  Asset: 1,
  Liability: 2,
  Equity: 3,
  Revenue: 4,
  Expense: 5,
});
export type FinancialAccountType = z.infer<typeof FinancialAccountType>;
export type FinancialAccountTypeCode = z.infer<typeof FinancialAccountTypeCode>;

export const FinancialAccount = z.object({
  id: z.uuid(),
  name: z.string(),
  type: z.preprocess(
    (value: string | number) => {
      if (Number.isSafeInteger(value)) {
        if (value === 1) return "Asset";
        else if (value === 2) return "Liability";
        else if (value === 3) return "Equity";
        else if (value === 4) return "Revenue";
        else if (value === 5) return "Expense";
        else return "";
      }
      return String(value);
    },
    FinancialAccountType,
  ),
});
export type FinancialAccount = z.infer<typeof FinancialAccount>;

export const UpsertFinancialAccount = FinancialAccount.extend({
  id: z.uuid().nullable(),
  type: z.preprocess(
    (value: string | number) => {
      if (Number.isSafeInteger(value)) {
        return Number(value);
      }
      switch (String(value).toLowerCase()) {
        case "asset":
          return 1;
        case "liability":
          return 2;
        case "equity":
          return 3;
        case "revenue":
          return 4;
        case "expense":
          return 5;
        default:
          return -1;
      }
    },
    FinancialAccountTypeCode,
  ),
});
export type UpsertFinancialAccount = z.infer<typeof UpsertFinancialAccount>;
