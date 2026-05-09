#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { VobizClient } from "./client.js";
import { registerCallTools } from "./tools/calls.js";
import { registerAudioTools } from "./tools/audio.js";
import { registerStreamTools } from "./tools/streams.js";
import { registerRecordingTools } from "./tools/recordings.js";
import { registerCdrTools } from "./tools/cdrs.js";
import { registerAccountTools } from "./tools/account.js";
import { registerConferenceTools } from "./tools/conferences.js";

const server = new McpServer(
  {
    name: "vobiz-voice",
    version: "0.1.0",
  },
  {
    instructions: [
      "Vobiz Voice MCP Server — provides tools for managing voice calls, audio streams, recordings, and phone numbers via the Vobiz SIP trunking platform.",
      "Authentication: Set VOBIZ_AUTH_ID and VOBIZ_AUTH_TOKEN environment variables.",
      "All phone numbers use E.164 format (e.g. +919876543210).",
      "Voice XML answer_url endpoints must return valid XML within 1-2 seconds.",
      "Audio streams use WebSocket (wss://) for real-time audio forking — ideal for AI voice agents.",
      "Supported codecs: G.711 µ-law (audio/x-mulaw;rate=8000), L16 (audio/x-l16;rate=8000/16000/24000).",
    ].join(" "),
  }
);

const client = new VobizClient();

registerCallTools(server, client);
registerAudioTools(server, client);
registerStreamTools(server, client);
registerRecordingTools(server, client);
registerCdrTools(server, client);
registerAccountTools(server, client);
registerConferenceTools(server, client);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Vobiz Voice MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
