import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { VobizClient } from "../client.js";
import { registerCallTools } from "../tools/calls.js";
import { registerAudioTools } from "../tools/audio.js";
import { registerStreamTools } from "../tools/streams.js";
import { registerRecordingTools } from "../tools/recordings.js";
import { registerCdrTools } from "../tools/cdrs.js";
import { registerAccountTools } from "../tools/account.js";
import { registerConferenceTools } from "../tools/conferences.js";

function setup() {
  process.env.VOBIZ_AUTH_ID = "TEST_ID";
  process.env.VOBIZ_AUTH_TOKEN = "TEST_TOKEN";

  const server = new McpServer({ name: "test", version: "0.0.1" });
  const client = new VobizClient();
  return { server, client };
}

function teardown() {
  delete process.env.VOBIZ_AUTH_ID;
  delete process.env.VOBIZ_AUTH_TOKEN;
}

describe("tool registration", () => {
  afterEach(teardown);

  it("registers all call tools without error", () => {
    const { server, client } = setup();
    expect(() => registerCallTools(server, client)).not.toThrow();
  });

  it("registers all audio tools without error", () => {
    const { server, client } = setup();
    expect(() => registerAudioTools(server, client)).not.toThrow();
  });

  it("registers all stream tools without error", () => {
    const { server, client } = setup();
    expect(() => registerStreamTools(server, client)).not.toThrow();
  });

  it("registers all recording tools without error", () => {
    const { server, client } = setup();
    expect(() => registerRecordingTools(server, client)).not.toThrow();
  });

  it("registers all CDR tools without error", () => {
    const { server, client } = setup();
    expect(() => registerCdrTools(server, client)).not.toThrow();
  });

  it("registers all account tools without error", () => {
    const { server, client } = setup();
    expect(() => registerAccountTools(server, client)).not.toThrow();
  });

  it("registers all conference tools without error", () => {
    const { server, client } = setup();
    expect(() => registerConferenceTools(server, client)).not.toThrow();
  });

  it("registers all 34 tools across all modules", () => {
    const { server, client } = setup();
    const registerSpy = vi.spyOn(server, "registerTool");

    registerCallTools(server, client);
    registerAudioTools(server, client);
    registerStreamTools(server, client);
    registerRecordingTools(server, client);
    registerCdrTools(server, client);
    registerAccountTools(server, client);
    registerConferenceTools(server, client);

    expect(registerSpy).toHaveBeenCalledTimes(34);

    const toolNames = registerSpy.mock.calls.map((call) => call[0] as string);
    expect(new Set(toolNames).size).toBe(34);
    expect(toolNames.every((n) => n.startsWith("vobiz_voice_"))).toBe(true);
  });
});
