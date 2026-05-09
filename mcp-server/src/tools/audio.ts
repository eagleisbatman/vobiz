import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { VobizClient } from "../client.js";

export function registerAudioTools(server: McpServer, client: VobizClient) {
  const id = client.accountId;

  server.registerTool(
    "vobiz_voice_play_audio",
    {
      title: "Play Audio on Call",
      description:
        "Play audio file(s) on an active call. Files must be accessible via HTTP/HTTPS. Multiple files play sequentially.",
      inputSchema: {
        call_uuid: z.string().describe("UUID of the active call"),
        urls: z.array(z.string().url()).describe("Audio file URLs (MP3, WAV)"),
        length: z.number().int().positive().optional().describe("Max playback duration in seconds"),
        legs: z.enum(["aleg", "bleg", "both"]).optional().describe("Which leg(s) hear audio (default: aleg)"),
        loop: z.boolean().optional().describe("Loop audio playback"),
        mix: z.boolean().optional().describe("Mix with call audio (default: true)"),
      },
    },
    async ({ call_uuid, ...body }) => {
      const result = await client.post(`/Account/${id}/Call/${call_uuid}/Play/`, body);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.registerTool(
    "vobiz_voice_stop_audio",
    {
      title: "Stop Audio Playback",
      description: "Stop any audio currently playing on a call.",
      inputSchema: {
        call_uuid: z.string().describe("UUID of the active call"),
      },
    },
    async ({ call_uuid }) => {
      const result = await client.delete(`/Account/${id}/Call/${call_uuid}/Play/`);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.registerTool(
    "vobiz_voice_speak_text",
    {
      title: "Speak Text (TTS)",
      description:
        "Convert text to speech and play it on an active call. Supports 29 languages.",
      inputSchema: {
        call_uuid: z.string().describe("UUID of the active call"),
        text: z.string().max(500).describe("Text to speak (max 500 chars recommended)"),
        voice: z.enum(["WOMAN", "MAN"]).optional().describe("Voice gender (default: WOMAN)"),
        language: z.string().optional().describe("Language code, e.g. en-US, hi-IN, es-ES (default: en-US)"),
        legs: z.enum(["aleg", "bleg", "both"]).optional().describe("Which leg(s) hear speech (default: aleg)"),
        loop: z.boolean().optional().describe("Repeat speech"),
        mix: z.boolean().optional().describe("Blend with call audio (default: true)"),
      },
    },
    async ({ call_uuid, ...body }) => {
      const result = await client.post(`/Account/${id}/Call/${call_uuid}/Speak/`, body);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.registerTool(
    "vobiz_voice_stop_speaking",
    {
      title: "Stop Text-to-Speech",
      description: "Stop any TTS currently playing on a call.",
      inputSchema: {
        call_uuid: z.string().describe("UUID of the active call"),
      },
    },
    async ({ call_uuid }) => {
      const result = await client.delete(`/Account/${id}/Call/${call_uuid}/Speak/`);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.registerTool(
    "vobiz_voice_send_dtmf",
    {
      title: "Send DTMF Digits",
      description:
        "Send DTMF tones on an active call. Useful for navigating IVR menus. Call must be active.",
      inputSchema: {
        call_uuid: z.string().describe("UUID of the active call"),
        digits: z.string().describe("DTMF characters: 0-9, *, #"),
        leg: z.enum(["aleg", "bleg"]).optional().describe("Target leg (default: aleg)"),
      },
    },
    async ({ call_uuid, ...body }) => {
      const result = await client.post(`/Account/${id}/Call/${call_uuid}/DTMF/`, body);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );
}
