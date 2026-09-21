import * as z from "zod";
import { Chrono } from "@anfi/lib";

/**
 * Input interface for creating a Financial Event.
 */
export const CreateFinancialEvent = z.object({
  /**
   * An optional ISO-8061 string indicating the date-time of the event.
   * For more information on ISO 8061, see {@link https://en.wikipedia.org/wiki/ISO_8601}.
   * @default Current unix timestamp.
   */
  timestamp: z.iso.datetime({ offset: true }).default(() =>
    Chrono.now().toString()
  ),

  /**
   * An optional description of the event.
   * @default Empty string (`""`)
   */
  description: z.string().optional(),

  /**
   * The list of Transaction(s) associated with the Financial Event.
   */
  transactions: z.object({
    amount: z.number().positive(),
    type: z.string().pipe(z.enum(["Credit", "Debit"])),
    financialAccountId: z.uuid(),
  }).array().min(2, "Financial event must have at least two transactions"),
});
export type CreateFinancialEvent = z.infer<typeof CreateFinancialEvent>;
export type CreateFinancialEventInput = z.input<typeof CreateFinancialEvent>;

export interface FinancialEventListItem {
  timestamp: string;
  sourceAccountName: string;
  targetAccountName: string;
  amount: number;
  description: string;
}
