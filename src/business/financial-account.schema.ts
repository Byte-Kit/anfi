import * as z from "zod";

export const FinancialAccountType = z.string().transform((value) =>
  z.enum([
    "Asset",
    "Liability",
    "Equity",
    "Revenue",
    "Expense",
  ]).parse(value)
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
   * @see {@link FinancialAccountType}
   */
  type: FinancialAccountType,
});
export type UpsertFinancialAccount = z.infer<typeof UpsertFinancialAccount>;
export type UpsertFinancialAccountInput = z.input<
  typeof UpsertFinancialAccount
>;
