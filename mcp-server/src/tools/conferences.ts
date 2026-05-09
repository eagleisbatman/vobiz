import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { VobizClient } from "../client.js";

export function registerConferenceTools(server: McpServer, client: VobizClient) {
  const id = client.accountId;

  server.registerTool(
    "vobiz_voice_get_conference",
    {
      title: "Get Conference",
      description:
        "Retrieve details of an active conference room including members, run time, and participant count.",
      inputSchema: {
        conference_name: z.string().describe("Conference room name (URL-encoded if it contains spaces)"),
      },
    },
    async ({ conference_name }) => {
      const encoded = encodeURIComponent(conference_name);
      const result = await client.get(`/Account/${id}/Conference/${encoded}/`);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.registerTool(
    "vobiz_voice_hangup_conference",
    {
      title: "Hang Up Conference",
      description:
        "Terminate a conference and disconnect all participants. Stops active recordings. This is irreversible.",
      inputSchema: {
        conference_name: z.string().describe("Conference room name to terminate"),
      },
    },
    async ({ conference_name }) => {
      const encoded = encodeURIComponent(conference_name);
      const result = await client.delete(`/Account/${id}/Conference/${encoded}/`);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.registerTool(
    "vobiz_voice_hangup_all_conferences",
    {
      title: "Hang Up All Conferences",
      description:
        "Terminate ALL active conferences simultaneously and disconnect all participants. This is irreversible — use with caution.",
      inputSchema: {},
    },
    async () => {
      const result = await client.delete(`/Account/${id}/Conference/`);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );
}
