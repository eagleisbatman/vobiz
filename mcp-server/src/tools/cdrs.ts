import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { VobizClient } from "../client.js";
import { cdrFilterSchema, buildQuery } from "./validation.js";

const safeIdPattern = /^[a-zA-Z0-9_-]+$/;

export function registerCdrTools(server: McpServer, client: VobizClient) {
  const id = client.accountId;

  server.registerTool(
    "vobiz_voice_list_cdrs",
    {
      title: "List CDRs",
      description:
        "List Call Detail Records with optional filters. Returns call metadata including duration, cost, status, and hangup cause.",
      inputSchema: cdrFilterSchema,
    },
    async (args) => {
      const result = await client.get(`/account/${id}/cdr`, buildQuery(args));
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.registerTool(
    "vobiz_voice_get_cdr",
    {
      title: "Get CDR",
      description: "Retrieve the Call Detail Record for a specific completed call.",
      inputSchema: {
        call_id: z.string().regex(safeIdPattern, "Must be alphanumeric (letters, digits, hyphens, underscores)").describe("Call ID from the CDR"),
      },
    },
    async ({ call_id }) => {
      const safeId = client.safePath(call_id, "call_id");
      const result = await client.get(`/account/${id}/cdr/${safeId}`);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.registerTool(
    "vobiz_voice_search_cdrs",
    {
      title: "Search CDRs",
      description:
        "Search Call Detail Records with filters. Similar to list but returns a filter_summary in the response.",
      inputSchema: cdrFilterSchema,
    },
    async (args) => {
      const result = await client.get(`/account/${id}/cdr/search`, buildQuery(args));
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.registerTool(
    "vobiz_voice_recent_cdrs",
    {
      title: "Recent CDRs",
      description: "Get the most recent Call Detail Records without requiring a date range.",
      inputSchema: {
        limit: z.number().int().min(1).max(100).optional().describe("Number of records (default: 20)"),
      },
    },
    async ({ limit }) => {
      const query: Record<string, string> = {};
      if (limit !== undefined) query.limit = String(limit);
      const result = await client.get(`/account/${id}/cdr/recent`, query);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.registerTool(
    "vobiz_voice_export_cdrs",
    {
      title: "Export CDRs as CSV",
      description:
        "Export Call Detail Records as CSV text. Accepts the same filters as list_cdrs. Returns raw CSV content.",
      inputSchema: cdrFilterSchema,
    },
    async (args) => {
      const result = await client.get(`/account/${id}/cdr/export`, buildQuery(args));
      return { content: [{ type: "text" as const, text: typeof result === "string" ? result : JSON.stringify(result, null, 2) }] };
    }
  );
}
