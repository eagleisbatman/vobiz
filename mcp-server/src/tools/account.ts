import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { VobizClient } from "../client.js";

/** Fields to strip from /auth/me responses to avoid leaking secrets. */
const REDACTED_FIELDS = ["auth_secret", "api_secret", "secret_key", "auth_token", "password", "secret", "token"];

function redactSensitiveFields(data: unknown): unknown {
  if (data === null || typeof data !== "object") return data;
  if (Array.isArray(data)) return data.map(redactSensitiveFields);
  const obj = data as Record<string, unknown>;
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (REDACTED_FIELDS.includes(key)) {
      cleaned[key] = "[REDACTED]";
    } else {
      cleaned[key] = redactSensitiveFields(value);
    }
  }
  return cleaned;
}

/** E.164 phone number: + followed by 1-15 digits */
const e164Pattern = /^\+[1-9]\d{1,14}$/;

export function registerAccountTools(server: McpServer, client: VobizClient) {
  const id = client.accountId;

  server.registerTool(
    "vobiz_voice_get_account",
    {
      title: "Get Account Details",
      description:
        "Retrieve account details including balance, limits, pricing tier, features, and risk status.",
      inputSchema: {},
    },
    async () => {
      const result = await client.get("/auth/me");
      const safe = redactSensitiveFields(result);
      return { content: [{ type: "text" as const, text: JSON.stringify(safe, null, 2) }] };
    }
  );

  server.registerTool(
    "vobiz_voice_list_numbers",
    {
      title: "List Phone Numbers",
      description:
        "List phone numbers owned by the account. Returns E.164 numbers with capabilities, status, and trunk assignment.",
      inputSchema: {
        page: z.number().int().min(1).optional().describe("Page number (default: 1)"),
        per_page: z.number().int().min(1).max(100).optional().describe("Items per page (default: 25)"),
        include_subaccounts: z.boolean().optional().describe("Include sub-account numbers (default: true for master)"),
      },
    },
    async (args) => {
      const query: Record<string, string> = {};
      if (args.page !== undefined) query.page = String(args.page);
      if (args.per_page !== undefined) query.per_page = String(args.per_page);
      if (args.include_subaccounts !== undefined) query.include_subaccounts = String(args.include_subaccounts);
      const result = await client.get(`/account/${id}/numbers`, query);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.registerTool(
    "vobiz_voice_list_inventory",
    {
      title: "List Available Numbers",
      description:
        "List phone numbers available for purchase from inventory. Filter by country code.",
      inputSchema: {
        country: z.string().optional().describe("Country code filter (e.g. US, IN)"),
        page: z.number().int().min(1).optional(),
        per_page: z.number().int().min(1).max(100).optional(),
      },
    },
    async (args) => {
      const query: Record<string, string> = {};
      if (args.country) query.country = args.country;
      if (args.page !== undefined) query.page = String(args.page);
      if (args.per_page !== undefined) query.per_page = String(args.per_page);
      const result = await client.get(`/account/${id}/inventory/numbers`, query);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.registerTool(
    "vobiz_voice_purchase_number",
    {
      title: "Purchase Phone Number",
      description:
        "Purchase a phone number from inventory. The number must be available (shown in list_inventory). Charges setup_fee and monthly_fee to the account.",
      inputSchema: {
        e164: z.string().regex(e164Pattern, "Must be E.164 format: +<country><number>").describe("Phone number in E.164 format (e.g. +919876543210)"),
        currency: z.string().optional().describe("Transaction currency (defaults to number's currency or USD)"),
      },
    },
    async (args) => {
      const result = await client.post(`/account/${id}/numbers/purchase-from-inventory`, args);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.registerTool(
    "vobiz_voice_release_number",
    {
      title: "Release Phone Number",
      description:
        "Release (unrent) a phone number back to inventory. This is permanent and irreversible.",
      inputSchema: {
        e164_number: z.string().regex(e164Pattern, "Must be E.164 format: +<country><number>").describe("Phone number in E.164 format to release"),
      },
    },
    async ({ e164_number }) => {
      const encoded = client.safePath(e164_number, "e164_number");
      const result = await client.delete(`/account/${id}/numbers/${encoded}`);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );
}
