import { z } from "zod";

/** UUID v4 pattern for call/stream/recording identifiers */
export const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** E.164 phone number: + followed by 1-15 digits, or digits-only variant used by Vobiz */
export const phonePattern = /^\+?[1-9]\d{1,14}$/;

/** Reusable Zod schema for UUID path parameters */
export const uuidParam = (label: string) =>
  z.string().regex(uuidPattern, `${label} must be a valid UUID`);

/** Shared CDR filter fields used by list, search, and export tools */
export const cdrFilterSchema = {
  from_number: z.string().optional().describe("Filter by originating phone number"),
  to_number: z.string().optional().describe("Filter by destination phone number"),
  start_date: z.string().optional().describe("Start date filter (YYYY-MM-DD)"),
  end_date: z.string().optional().describe("End date filter (YYYY-MM-DD)"),
  call_direction: z.enum(["inbound", "outbound"]).optional().describe("Filter by direction"),
  min_duration: z.number().int().min(0).optional().describe("Minimum call duration in seconds"),
  page: z.number().int().min(1).optional().describe("Page number (default: 1)"),
  per_page: z.number().int().min(1).max(100).optional().describe("Items per page (default: 20)"),
};

/** Build a query string record from an args object, converting all values to strings */
export function buildQuery(args: Record<string, unknown>): Record<string, string> {
  const query: Record<string, string> = {};
  for (const [k, v] of Object.entries(args)) {
    if (v !== undefined) query[k] = String(v);
  }
  return query;
}
