import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { VobizClient } from "../client.js";
import { uuidParam, phonePattern } from "./validation.js";

export function registerCallTools(server: McpServer, client: VobizClient) {
  const id = client.accountId;

  server.registerTool(
    "vobiz_voice_make_call",
    {
      title: "Make a Call",
      description:
        "Initiate an outbound call. Returns a request_uuid for tracking. The answer_url must return valid Voice XML to control the call flow.",
      inputSchema: {
        from: z.string().regex(phonePattern, "Must be E.164 format").describe("Caller ID in E.164 format (e.g. 914155551234)"),
        to: z.string().describe("Destination number(s) in E.164 format. Use < separator for multiple (max 1000)"),
        answer_url: z.string().url().describe("URL invoked when call is answered; must return valid Voice XML"),
        answer_method: z.enum(["GET", "POST"]).optional().describe("HTTP method for answer_url"),
        hangup_url: z.string().url().optional().describe("URL called on hangup"),
        hangup_method: z.enum(["GET", "POST"]).optional(),
        fallback_url: z.string().url().optional().describe("Backup URL if answer_url fails"),
        fallback_method: z.enum(["GET", "POST"]).optional().describe("HTTP method for fallback_url"),
        ring_url: z.string().url().optional().describe("URL called on ring"),
        ring_method: z.enum(["GET", "POST"]).optional().describe("HTTP method for ring_url"),
        caller_name: z.string().optional().describe("Caller ID name"),
        time_limit: z.number().int().positive().optional().describe("Max call duration in seconds"),
        hangup_on_ring: z.number().int().positive().optional().describe("Hang up after N rings"),
        machine_detection: z.enum(["true", "hangup"]).optional().describe("AMD: 'true' to continue, 'hangup' to disconnect on machine"),
        machine_detection_time: z.number().int().min(2000).max(10000).optional().describe("AMD analysis duration in ms (default 5000)"),
        machine_detection_url: z.string().url().optional().describe("Callback URL for async AMD results"),
        machine_detection_method: z.enum(["GET", "POST"]).optional().describe("HTTP method for machine_detection_url (default: POST)"),
        machine_detection_maximum_speech_length: z.number().int().min(1000).max(6000).optional().describe("Max speech for AMD in ms (default 5000)"),
        machine_detection_initial_silence: z.number().int().min(2000).max(10000).optional().describe("Max post-answer silence for AMD in ms (default 4500)"),
        machine_detection_maximum_words: z.number().int().min(2).max(10).optional().describe("Max sentences for AMD (default 3)"),
        machine_detection_initial_greeting: z.number().int().min(1000).max(5000).optional().describe("Max greeting for AMD in ms (default 1500)"),
        send_digits: z.string().optional().describe("DTMF digits to send on answer"),
        send_on_preanswer: z.boolean().optional().describe("Send digits during early media"),
      },
    },
    async (args) => {
      const result = await client.post(`/Account/${id}/Call/`, args);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.registerTool(
    "vobiz_voice_transfer_call",
    {
      title: "Transfer a Call",
      description:
        "Redirect an active call to a new Voice XML instruction URL. The call must be in-progress.",
      inputSchema: {
        call_uuid: uuidParam("call_uuid").describe("UUID of the active call to transfer"),
        legs: z.enum(["aleg", "bleg", "both"]).optional().describe("Which leg(s) to transfer (default: aleg)"),
        aleg_url: z.string().url().optional().describe("New XML instruction URL for A leg"),
        aleg_method: z.enum(["GET", "POST"]).optional(),
        bleg_url: z.string().url().optional().describe("New XML instruction URL for B leg"),
        bleg_method: z.enum(["GET", "POST"]).optional(),
      },
    },
    async ({ call_uuid, ...body }) => {
      const safeUuid = client.safePath(call_uuid, "call_uuid");
      const result = await client.post(`/Account/${id}/Call/${safeUuid}/`, body);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.registerTool(
    "vobiz_voice_hangup_call",
    {
      title: "Hang Up a Call",
      description:
        "Terminate an active call immediately. Triggers hangup_url callback. CDR will show hangup_source as 'API'.",
      inputSchema: {
        call_uuid: uuidParam("call_uuid").describe("UUID of the call to hang up"),
      },
    },
    async ({ call_uuid }) => {
      const safeUuid = client.safePath(call_uuid, "call_uuid");
      const result = await client.delete(`/Account/${id}/Call/${safeUuid}/`);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.registerTool(
    "vobiz_voice_list_live_calls",
    {
      title: "List Live Calls",
      description: "Retrieve UUIDs of all currently active calls on the account.",
      inputSchema: {},
    },
    async () => {
      const result = await client.get(`/account/${id}/call/`, { status: "live" });
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.registerTool(
    "vobiz_voice_get_live_call",
    {
      title: "Get Live Call Details",
      description:
        "Retrieve details of a specific active call including state, duration, direction, and numbers. Returns 404 if call is not active.",
      inputSchema: {
        call_uuid: uuidParam("call_uuid").describe("UUID of the live call"),
      },
    },
    async ({ call_uuid }) => {
      const safeUuid = client.safePath(call_uuid, "call_uuid");
      const result = await client.get(`/account/${id}/call/${safeUuid}/`, { status: "live" });
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.registerTool(
    "vobiz_voice_list_queued_calls",
    {
      title: "List Queued Calls",
      description: "Retrieve UUIDs of all queued calls (max 20 per request).",
      inputSchema: {},
    },
    async () => {
      const result = await client.get(`/account/${id}/call/`, { status: "queued" });
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.registerTool(
    "vobiz_voice_get_queued_call",
    {
      title: "Get Queued Call Details",
      description:
        "Retrieve details of a specific queued call including direction, from/to numbers, and request UUID. Returns 404 if call is not queued.",
      inputSchema: {
        call_uuid: uuidParam("call_uuid").describe("UUID of the queued call"),
      },
    },
    async ({ call_uuid }) => {
      const safeUuid = client.safePath(call_uuid, "call_uuid");
      const result = await client.get(`/account/${id}/call/${safeUuid}/`, { status: "queued" });
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );
}
