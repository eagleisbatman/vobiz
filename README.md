# Vobiz

A [Claude Code](https://claude.ai/code) plugin for building voice applications on the [Vobiz](https://www.vobiz.ai/) telephony platform. Also works with [Codex](https://openai.com/index/codex/).

Install the plugin, set two environment variables, and you can build, deploy, and manage voice apps entirely from your coding assistant.

## Install

### 1. Set your Vobiz credentials

Sign up at [vobiz.ai](https://www.vobiz.ai/) and find your **Auth ID** and **Auth Token** on the dashboard.

Add them to your shell profile (`~/.zshrc` or `~/.bashrc`):

```bash
export VOBIZ_AUTH_ID="MA_XXXXXXXX"
export VOBIZ_AUTH_TOKEN="your-auth-token"
```

Then restart your terminal or run `source ~/.zshrc`.

### 2. Install the plugin

**Claude Code:**
```
/install-plugin eagleisbatman/vobiz
```

**Codex** (or any tool that reads `.mcp.json`):

Add this to your project's `.mcp.json`:
```json
{
  "mcpServers": {
    "vobiz-voice": {
      "command": "node",
      "args": ["<path-to-plugin>/mcp-server/dist/bundle.cjs"],
      "env": {
        "VOBIZ_AUTH_ID": "${VOBIZ_AUTH_ID}",
        "VOBIZ_AUTH_TOKEN": "${VOBIZ_AUTH_TOKEN}"
      }
    }
  }
}
```

That's it. You now have 34 MCP tools and 11 slash commands.

## What you can do

### Build voice apps (slash commands)

| Command | What it does |
|---------|-------------|
| `/vobiz-webhook-server` | Scaffold a webhook server that handles Vobiz call events and returns Voice XML |
| `/vobiz-voice-agent` | Build a real-time AI voice agent (WebSocket audio + STT + LLM + TTS pipeline) |
| `/vobiz-ivr-builder` | Design and generate an IVR system with menus, routing, voicemail, business hours |
| `/vobiz-call-analytics` | Analyze call data — volume, cost, quality, patterns, alerts |

### Provision infrastructure (slash commands)

| Command | What it does |
|---------|-------------|
| `/vobiz-setup-full` | Full setup — trunk, credentials, origination URI, app, phone number |
| `/vobiz-setup-trunk` | Create or manage SIP trunks |
| `/vobiz-setup-credentials` | Create or manage trunk credentials |
| `/vobiz-setup-app` | Create or manage voice applications |
| `/vobiz-setup-endpoint` | Create or manage SIP endpoints |
| `/vobiz-setup-origination-uri` | Create or manage origination URIs |
| `/vobiz-voicexml` | Voice XML reference and builder |

### Manage calls and resources (MCP tools)

The 34 MCP tools are available automatically — just ask Claude or Codex to do things like:

- "Make a test call to +919876543210"
- "Stream this call's audio to my WebSocket server"
- "Show me today's call history"
- "How much did I spend on calls this week?"
- "List my phone numbers"
- "Purchase a new number from inventory"
- "Play an audio file on this active call"
- "Record this call"

Tools cover: calls (7), audio (5), streams (5), recordings (4), CDRs (5), conferences (3), account & numbers (5).

## Example workflows

### "I want to build an AI phone agent"

1. `/vobiz-setup-full` — provisions trunk, credentials, phone number
2. `/vobiz-voice-agent` — scaffolds the WebSocket agent server (STT + LLM + TTS)
3. Deploy the server, point the Vobiz app's answer_url at it
4. "Make a test call to my number" — Claude makes the call via MCP tools
5. `/vobiz-call-analytics` — review call quality and costs

### "I need an IVR for my business"

1. `/vobiz-ivr-builder` — design menu tree, business hours, routing rules
2. `/vobiz-webhook-server` — already generated as part of the IVR
3. Deploy, assign phone number
4. "Call my IVR number and test it" — Claude makes the call

### "I want to add voice to my existing app"

1. `/vobiz-webhook-server` — scaffold the webhook handler in your project
2. Use MCP tools to make outbound calls with `answer_url` pointing to your server
3. `/vobiz-voicexml` — reference for building call flow XML responses

## Development

```bash
cd mcp-server
npm install
npm test          # 33 tests
npm run build     # TypeScript + esbuild bundle
npm start         # run the MCP server locally
```

## License

MIT
