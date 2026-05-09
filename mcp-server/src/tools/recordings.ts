import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { VobizClient } from "../client.js";

export function registerRecordingTools(server: McpServer, client: VobizClient) {
  const id = client.accountId;

  server.registerTool(
    "vobiz_voice_list_recordings",
    {
      title: "List Recordings",
      description: "List call recordings with optional filters. Returns recording metadata and download URLs.",
      inputSchema: {
        limit: z.number().int().min(1).max(100).optional().describe("Max per page (default: 20)"),
        offset: z.number().int().min(0).optional().describe("Pagination offset"),
        call_uuid: z.string().optional().describe("Filter by call UUID"),
        recording_type: z.enum(["trunk", "extension"]).optional().describe("Filter by recording type"),
      },
    },
    async ({ limit, offset, call_uuid, recording_type }) => {
      const query: Record<string, string> = {};
      if (limit !== undefined) query.limit = String(limit);
      if (offset !== undefined) query.offset = String(offset);
      if (call_uuid) query.call_uuid = call_uuid;
      if (recording_type) query.recording_type = recording_type;
      const result = await client.get(`/Account/${id}/Recording/`, query);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.registerTool(
    "vobiz_voice_get_recording",
    {
      title: "Get Recording",
      description:
        "Retrieve details of a specific recording including duration, format, and download URL.",
      inputSchema: {
        recording_id: z.string().describe("UUID of the recording"),
      },
    },
    async ({ recording_id }) => {
      const result = await client.get(`/Account/${id}/Recording/${recording_id}/`);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.registerTool(
    "vobiz_voice_delete_recording",
    {
      title: "Delete Recording",
      description: "Permanently delete a recording. This is irreversible — the file and URL become inaccessible.",
      inputSchema: {
        recording_id: z.string().describe("UUID of the recording to delete"),
      },
    },
    async ({ recording_id }) => {
      const result = await client.delete(`/Account/${id}/Recording/${recording_id}/`);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );
}
