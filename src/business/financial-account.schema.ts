import * as z from "zod";

export const FinancialAccountType = z.enum([
  "Asset",
  "Liability",
  "Equity",
  "Revenue",
  "Expense",
]);

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
  name: z.string().trim().min(1, "Account name cannot be empty"),

  /**
   * The code indicating the type of the Financial Account.
   */
  type: z.string().pipe(FinancialAccountType),
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
  id: z.uuid().nullish(),

  /**
   * The name of the Financial Account,
   * which will overwrite the existing name when updating an existing record.
   */
  name: z.string().trim().min(1, "Account name cannot be empty"),

  /**
   * The type of the Financial Account,
   * which will overwrite the existing type when updating an existing record.
   */
  type: z.string().pipe(FinancialAccountType),
});
export type UpsertFinancialAccount = z.infer<typeof UpsertFinancialAccount>;
export type UpsertFinancialAccountInput = z.input<
  typeof UpsertFinancialAccount
>;
