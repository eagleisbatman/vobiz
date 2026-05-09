import { z } from "zod";

/** UUID v4 pattern for call/stream/recording identifiers */
export const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** E.164 phone number: + followed by 1-15 digits, or digits-only variant used by Vobiz */
export const phonePattern = /^\+?[1-9]\d{1,14}$/;

/** Reusable Zod schema for UUID path parameters */
export const uuidParam = (label: string) =>
  z.string().regex(uuidPattern, `${label} must be a valid UUID`);
