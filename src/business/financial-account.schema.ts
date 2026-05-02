import * as z from "zod";

const FinancialAccountTypeCodeParser = z.union([z.string(), z.number()])
  .transform((value) => {
    if (Number.isSafeInteger(value)) {
      return value;
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
  })
  .transform((value) => z.number().parse(value));
export const FinancialAccountTypeCode = FinancialAccountTypeCodeParser
  .transform((value) => {
    return z
      .enum({
        Asset: 1,
        Liability: 2,
        Equity: 3,
        Revenue: 4,
        Expense: 5,
      })
      .parse(value);
  });
export type FinancialAccountTypeCode = z.infer<typeof FinancialAccountTypeCode>;

const FinancialAccountTypeParser = z.union([z.string(), z.number()])
  .transform((value) => {
    if (Number.isSafeInteger(value)) {
      switch (value) {
        case 1:
          return "Asset";
        case 2:
          return "Liability";
        case 3:
          return "Equity";
        case 4:
          return "Revenue";
        case 5:
          return "Expense";
        default:
          return "";
      }
    }

    return String(value)
      .split("")
      .map((char, index) => index === 0 ? char.toUpperCase() : char);
  })
  .transform((value) => z.string().parse(value));
export const FinancialAccountType = FinancialAccountTypeParser.transform(
  (value) => {
    return z.enum([
      "Asset",
      "Liability",
      "Equity",
      "Revenue",
      "Expense",
    ]).parse(value);
  },
);
export type FinancialAccountType = z.infer<typeof FinancialAccountType>;

/**
 * Representation of a Financial Account.
 */
export const FinancialAccount = z.object({
  /**
   * The ID of the Financial Account.
   */
  id: z.uuid(),

  /**
   * The name of the Financial Account.
   */
  name: z.string(),

  /**
   * The code indicating the type of the Financial Account.
   */
  type: FinancialAccountType,
});
export type FinancialAccount = z.infer<typeof FinancialAccount>;
export type FinancialAccountInput = z.input<typeof FinancialAccount>;

/**
 * Input interface for upserting a Financial Account.
 */
export const UpsertFinancialAccount = z.object({
  /**
   * An optional ID indicating the to-be-updated Financial Account.
   */
  id: z.uuid().nullable(),

  /**
   * The name of the Financial Account,
   * which will overwrite the existing name when updating an existing record.
   */
  name: z.string(),

  /**
   * The type of the Financial Account,
   * which will ovewrite the existing type when updating an existing record.
   *
   * Can either be a string or an integer.
   *
   * @see {@link FinancialAccountType} and {@link FinancialAccountTypeCode}.
   */
  type: FinancialAccountTypeCode,
});
export type UpsertFinancialAccount = z.infer<typeof UpsertFinancialAccount>;
export type UpsertFinancialAccountInput = z.input<
  typeof UpsertFinancialAccount
>;
