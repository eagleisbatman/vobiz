import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { VobizClient } from "../client.js";

export function registerStreamTools(server: McpServer, client: VobizClient) {
  const id = client.accountId;

  server.registerTool(
    "vobiz_voice_start_stream",
    {
      title: "Start Audio Stream",
      description:
        "Fork real-time audio from an active call to a WebSocket endpoint. Supports bidirectional streaming for AI voice agents. Billed per minute of audio forked.",
      inputSchema: {
        call_uuid: z.string().describe("UUID of the active call"),
        service_url: z.string().describe("WebSocket URL (wss:// or ws://) to receive audio"),
        audio_track: z
          .enum(["inbound", "outbound", "both"])
          .optional()
          .describe("Which audio track to stream (default: inbound)"),
        bidirectional: z.boolean().optional().describe("Enable sending audio back to the call (default: false)"),
        content_type: z
          .string()
          .optional()
          .describe("Codec: audio/x-l16;rate=8000, audio/x-l16;rate=16000, audio/x-mulaw;rate=8000"),
        stream_timeout: z.number().int().positive().optional().describe("Max stream duration in seconds (default: 86400)"),
        status_callback_url: z.string().url().optional().describe("Webhook URL for stream status changes"),
        status_callback_method: z.enum(["GET", "POST"]).optional(),
        extra_headers: z.string().optional().describe("Comma-separated custom headers for WebSocket connection"),
      },
    },
    async ({ call_uuid, ...body }) => {
      const result = await client.post(`/Account/${id}/Call/${call_uuid}/Stream/`, body);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.registerTool(
    "vobiz_voice_get_stream",
    {
      title: "Get Audio Stream",
      description: "Retrieve details of a specific audio stream on a call.",
      inputSchema: {
        call_uuid: z.string().describe("UUID of the call"),
        stream_id: z.string().describe("UUID of the audio stream"),
      },
    },
    async ({ call_uuid, stream_id }) => {
      const result = await client.get(`/Account/${id}/Call/${call_uuid}/Stream/${stream_id}/`);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.registerTool(
    "vobiz_voice_list_streams",
    {
      title: "List Audio Streams",
      description: "List all audio streams on a call.",
      inputSchema: {
        call_uuid: z.string().describe("UUID of the call"),
        limit: z.number().int().min(1).max(100).optional().describe("Results per page (default: 20)"),
        offset: z.number().int().min(0).optional().describe("Pagination offset"),
      },
    },
    async ({ call_uuid, limit, offset }) => {
      const query: Record<string, string> = {};
      if (limit !== undefined) query.limit = String(limit);
      if (offset !== undefined) query.offset = String(offset);
      const result = await client.get(`/Account/${id}/Call/${call_uuid}/Stream/`, query);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.registerTool(
    "vobiz_voice_stop_stream",
    {
      title: "Stop Audio Stream",
      description: "Stop a specific audio stream without affecting others on the same call.",
      inputSchema: {
        call_uuid: z.string().describe("UUID of the call"),
        stream_id: z.string().describe("UUID of the stream to stop"),
      },
    },
    async ({ call_uuid, stream_id }) => {
      const result = await client.delete(`/Account/${id}/Call/${call_uuid}/Stream/${stream_id}/`);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.registerTool(
    "vobiz_voice_stop_all_streams",
    {
      title: "Stop All Audio Streams",
      description: "Stop all active audio streams on a call. Idempotent — already-stopped streams are unaffected.",
      inputSchema: {
        call_uuid: z.string().describe("UUID of the call"),
      },
    },
    async ({ call_uuid }) => {
      const result = await client.delete(`/Account/${id}/Call/${call_uuid}/Stream/`);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );
}
