import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { VobizClient } from "../client.js";

export function registerCdrTools(server: McpServer, client: VobizClient) {
  const id = client.accountId;

  server.registerTool(
    "vobiz_voice_list_cdrs",
    {
      title: "List CDRs",
      description:
        "List Call Detail Records with optional filters. Returns call metadata including duration, cost, status, and hangup cause.",
      inputSchema: {
        from_number: z.string().optional().describe("Filter by originating phone number"),
        to_number: z.string().optional().describe("Filter by destination phone number"),
        start_date: z.string().optional().describe("Start date filter (YYYY-MM-DD)"),
        end_date: z.string().optional().describe("End date filter (YYYY-MM-DD)"),
        call_direction: z.enum(["inbound", "outbound"]).optional().describe("Filter by direction"),
        min_duration: z.number().int().min(0).optional().describe("Minimum call duration in seconds"),
        page: z.number().int().min(1).optional().describe("Page number (default: 1)"),
        per_page: z.number().int().min(1).max(100).optional().describe("Items per page (default: 20)"),
      },
    },
    async (args) => {
      const query: Record<string, string> = {};
      for (const [k, v] of Object.entries(args)) {
        if (v !== undefined) query[k] = String(v);
      }
      const result = await client.get(`/account/${id}/cdr`, query);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.registerTool(
    "vobiz_voice_get_cdr",
    {
      title: "Get CDR",
      description: "Retrieve the Call Detail Record for a specific completed call.",
      inputSchema: {
        call_id: z.string().describe("Call ID from the CDR"),
      },
    },
    async ({ call_id }) => {
      const result = await client.get(`/account/${id}/cdr/${call_id}`);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.registerTool(
    "vobiz_voice_search_cdrs",
    {
      title: "Search CDRs",
      description:
        "Search Call Detail Records with filters. Similar to list but returns a filter_summary in the response.",
      inputSchema: {
        from_number: z.string().optional().describe("Originating phone number"),
        to_number: z.string().optional().describe("Destination phone number"),
        start_date: z.string().optional().describe("Start date (YYYY-MM-DD)"),
        end_date: z.string().optional().describe("End date (YYYY-MM-DD)"),
        call_direction: z.enum(["inbound", "outbound"]).optional(),
        min_duration: z.number().int().min(0).optional(),
        page: z.number().int().min(1).optional(),
        per_page: z.number().int().min(1).max(100).optional(),
      },
    },
    async (args) => {
      const query: Record<string, string> = {};
      for (const [k, v] of Object.entries(args)) {
        if (v !== undefined) query[k] = String(v);
      }
      const result = await client.get(`/account/${id}/cdr/search`, query);
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
}
