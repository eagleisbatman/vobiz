# Vobiz

A [Claude Code](https://claude.ai/code) plugin for building voice applications on the [Vobiz](https://www.vobiz.ai/) telephony platform. Also works with [Codex](https://openai.com/index/codex/).

Install the plugin, set two environment variables, and you can build, deploy, and manage voice apps entirely from your coding assistant.

## Install

### Step 1: Get your Vobiz credentials

Sign up at [vobiz.ai](https://www.vobiz.ai/) and find your **Auth ID** and **Auth Token** on the dashboard.

Add them to your shell profile (`~/.zshrc` or `~/.bashrc`):

```bash
export VOBIZ_AUTH_ID="MA_XXXXXXXX"
export VOBIZ_AUTH_TOKEN="your-auth-token"
```

Restart your terminal or run `source ~/.zshrc`.

### Step 2: Install the plugin

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

That's it. You now have 34 MCP tools and 11 slash commands available in every project.

### Verify it works

Open Claude Code in any project and say:

> "Show me my Vobiz account details"

Claude will call the `vobiz_voice_get_account` tool and show your account balance, limits, and pricing tier. If you see your account info, everything is working.

---

## Tutorial: Build your first voice app

This walkthrough takes you from zero to a working AI voice agent that answers phone calls. Takes about 15 minutes.

### 1. Provision your Vobiz infrastructure

Open Claude Code in a new project directory and run:

```
/vobiz-setup-full
```

This interactive skill walks you through creating everything you need:

- **SIP Trunk** — the telephony pipe that carries your calls
- **Credentials** — username/password for SIP authentication
- **Origination URI** — where outbound calls route to (your server's SIP address)
- **Application** — links your phone number to your webhook server's URL
- **Phone Number** — (optional) purchase a DID from Vobiz inventory

At the end, you'll see a summary like:

```
Trunk ID:      abc123-def456
Trunk Domain:  abc123-def456.sip.vobiz.ai
Credential ID: cred-789
App ID:        12345678
Phone Number:  +919876543210
SIP Server:    sip.vobiz.ai:5060
```

Save these — you'll need the App ID and phone number.

> **Note:** You only provision infrastructure once. All future projects reuse the same trunk and credentials. If you already have a trunk, skip to step 2.

### 2. Scaffold your voice application

Now build the actual app. Pick the skill that matches what you want:

#### Option A: AI Voice Agent (real-time conversation)

```
/vobiz-voice-agent
```

This scaffolds a complete real-time voice AI server:

- **WebSocket server** that receives live call audio from Vobiz
- **STT pipeline** (Deepgram by default) that transcribes caller speech in real-time
- **LLM integration** (Claude by default) that generates conversational responses
- **TTS pipeline** (ElevenLabs by default) that speaks responses back to the caller
- **Audio conversion** — handles mulaw/PCM codec translation between Vobiz and providers
- **Conversation state** — tracks context per call via CallUUID

The skill asks which STT/LLM/TTS providers you want, then generates the full project with all the wiring done.

#### Option B: Webhook Server (custom call flows)

```
/vobiz-webhook-server
```

This scaffolds a Node.js/Express server with:

- Route handlers for all Vobiz webhooks (`/answer`, `/hangup`, `/fallback`, `/status`)
- A typed Voice XML builder (no raw XML strings)
- Templates for common patterns: greeting, IVR menu, call transfer, voicemail, AI streaming
- Railway deployment config

You tell it what kind of call flow you need, and it generates the right routes.

#### Option C: IVR Phone Menu

```
/vobiz-ivr-builder
```

This designs and generates a complete IVR system:

- Multi-level DTMF menus ("Press 1 for sales, 2 for support...")
- Business hours logic (different flows for open/closed/holidays)
- Call routing to different departments
- Voicemail recording with transcription
- Retry and timeout handling

You describe your menu structure, and it generates the full webhook server with all routes.

### 3. Configure your environment

The scaffolded project will have a `.env.example`. Copy it and fill in your keys:

```bash
cp .env.example .env
```

```bash
# .env
PORT=3000

# Vobiz (already in your shell, but needed for the app if it makes outbound calls)
VOBIZ_AUTH_ID=MA_XXXXXXXX
VOBIZ_AUTH_TOKEN=your-auth-token

# For AI Voice Agent — add the providers you chose:
DEEPGRAM_API_KEY=your-deepgram-key
ANTHROPIC_API_KEY=your-anthropic-key
ELEVENLABS_API_KEY=your-elevenlabs-key
ELEVENLABS_VOICE_ID=your-voice-id

# Agent personality
AI_SYSTEM_PROMPT="You are a helpful phone assistant for Acme Corp..."
```

### 4. Deploy

Push to your hosting platform. Example with Railway:

```bash
git init && git add -A && git commit -m "Initial voice app"
railway link
railway up
```

Your app is now live at something like `https://my-voice-app.up.railway.app`.

### 5. Connect Vobiz to your server

Now point your Vobiz Application's `answer_url` at your deployed server. You can either:

**Use the setup skill:**
```
/vobiz-setup-app
```
Set the `answer_url` to `https://my-voice-app.up.railway.app/answer`.

**Or just tell Claude:**
> "Update my Vobiz application 12345678 to use answer_url https://my-voice-app.up.railway.app/answer"

### 6. Test it

Make a test call:

> "Make a call from +919876543210 to +91XXXXXXXXXX with answer_url https://my-voice-app.up.railway.app/answer"

Claude uses the `vobiz_voice_make_call` MCP tool to initiate the call. Your phone rings. When you answer, Vobiz hits your webhook, your server returns Voice XML (or starts the WebSocket stream), and you hear your AI agent.

### 7. Monitor

After calls start flowing, check how things are going:

```
/vobiz-call-analytics
```

This pulls your CDR (Call Detail Records) data and shows:

- Call volume, answer rate, average duration
- Cost breakdown and projected monthly spend
- Hangup cause distribution (are calls failing?)
- Alerts for numbers approaching spam thresholds

You can also ask Claude directly at any time:

> "Show me recent calls"
> "How much did I spend on calls today?"
> "List my active phone numbers"

---

## Ongoing usage

Once you're set up, you don't need to run through the tutorial again. Here's what day-to-day usage looks like:

### Making changes to your app

Just edit your code and push. Tell Claude what you want:

> "Add a voicemail fallback when no one answers"
> "Change the IVR menu to add a billing option"
> "Switch the TTS voice to a different ElevenLabs model"

Use `/vobiz-voicexml` anytime you need help building Voice XML responses.

### Managing calls in real-time

The MCP tools let you control live calls from Claude:

> "List all active calls"
> "Hang up call abc-123"
> "Stream call abc-123 to wss://my-monitor.com/stream"
> "Play a hold music file on call abc-123"
> "Send DTMF digits 1234# on call abc-123"

### Managing phone numbers

> "List my numbers"
> "Show available numbers in India"
> "Purchase +919876543210"
> "Release +919876543210"

### Recordings

> "List today's recordings"
> "Get the download URL for recording xyz-789"
> "Delete recording xyz-789"

---

## All slash commands

| Command | Purpose |
|---------|---------|
| `/vobiz-voice-agent` | Scaffold a real-time AI voice agent (WebSocket + STT + LLM + TTS) |
| `/vobiz-webhook-server` | Scaffold a webhook server for Vobiz call events |
| `/vobiz-ivr-builder` | Design and generate an IVR menu system |
| `/vobiz-call-analytics` | Analyze call volume, cost, quality, patterns |
| `/vobiz-setup-full` | Full provisioning — trunk, credentials, URI, app, number |
| `/vobiz-setup-trunk` | Create or manage SIP trunks |
| `/vobiz-setup-credentials` | Create or manage trunk credentials |
| `/vobiz-setup-app` | Create or manage voice applications |
| `/vobiz-setup-endpoint` | Create or manage SIP endpoints |
| `/vobiz-setup-origination-uri` | Create or manage origination URIs |
| `/vobiz-voicexml` | Voice XML reference and builder |

## All MCP tools (34)

Calls (7), Audio (5), Streams (5), Recordings (4), CDRs (5), Conferences (3), Account & Numbers (5). All tools are prefixed with `vobiz_voice_` and are auto-discovered by Claude Code and Codex — you don't need to memorize them. Just describe what you want in natural language.

## Development

To contribute or modify the MCP server:

```bash
cd mcp-server
npm install
npm test          # 33 tests
npm run build     # TypeScript + esbuild bundle (741KB, zero deps)
npm start         # run the MCP server locally
```

## License

MIT
