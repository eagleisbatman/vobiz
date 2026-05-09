# Vobiz — Claude Code Plugin

Build AI voice agents faster. This plugin gives [Claude Code](https://claude.ai/code) full access to the [Vobiz](https://www.vobiz.ai/) voice/telephony platform — make calls, stream audio to AI models, manage recordings, and provision SIP infrastructure, all from your coding assistant.

## What you get

- **31 MCP tools** — make/transfer/hangup calls, play audio, stream to WebSockets, manage recordings, browse CDRs, purchase phone numbers
- **7 slash commands** — set up SIP trunks, credentials, endpoints, applications, and origination URIs without leaving Claude Code
- **Zero dependencies** — the MCP server is bundled into a single file, nothing to install beyond the plugin itself

## Install

### 1. Get a Vobiz account

Sign up at [vobiz.ai](https://www.vobiz.ai/) and grab your **Auth ID** and **Auth Token** from the dashboard.

### 2. Set your credentials

Add to your `~/.zshrc` (or `~/.bashrc`):

```bash
export VOBIZ_AUTH_ID="your-auth-id"
export VOBIZ_AUTH_TOKEN="your-auth-token"
```

Restart your terminal or run `source ~/.zshrc`.

### 3. Install the plugin

In Claude Code:

```
claude plugin marketplace add eagleisbatman/vobiz
```

Then:

```
/plugin install vobiz
```

Done. You now have all 31 tools and 7 commands available.

## Usage examples

**"Make a test call to my phone"**
> Claude uses `vobiz_voice_make_call` with your number and an answer URL

**"Set up a new SIP trunk for my LiveKit agent"**
> Run `/vobiz-setup-full` — walks through trunk, credentials, origination URI, and app creation

**"Stream this call's audio to my AI agent via WebSocket"**
> Claude uses `vobiz_voice_start_stream` with your `wss://` endpoint

**"Show me today's call history"**
> Claude uses `vobiz_voice_list_cdrs` or `vobiz_voice_recent_cdrs`

**"Help me write the Voice XML for an IVR menu"**
> Run `/vobiz-voicexml` — provides the full XML reference and builds the response with you

## Tools reference

### Calls
| Tool | Description |
|------|-------------|
| `vobiz_voice_make_call` | Initiate an outbound call |
| `vobiz_voice_transfer_call` | Transfer a live call |
| `vobiz_voice_hangup_call` | Hang up a call |
| `vobiz_voice_list_live_calls` | List all live calls |
| `vobiz_voice_get_live_call` | Get details of a live call |
| `vobiz_voice_list_queued_calls` | List queued calls |

### Audio
| Tool | Description |
|------|-------------|
| `vobiz_voice_play_audio` | Play audio file on a call |
| `vobiz_voice_stop_audio` | Stop audio playback |
| `vobiz_voice_speak_text` | Text-to-speech on a call |
| `vobiz_voice_stop_speaking` | Stop TTS playback |
| `vobiz_voice_send_dtmf` | Send DTMF tones |

### Audio Streams
| Tool | Description |
|------|-------------|
| `vobiz_voice_start_stream` | Start WebSocket audio stream |
| `vobiz_voice_get_stream` | Get stream details |
| `vobiz_voice_list_streams` | List active streams |
| `vobiz_voice_stop_stream` | Stop a specific stream |
| `vobiz_voice_stop_all_streams` | Stop all streams on a call |

### Recordings
| Tool | Description |
|------|-------------|
| `vobiz_voice_list_recordings` | List recordings |
| `vobiz_voice_get_recording` | Get recording details |
| `vobiz_voice_delete_recording` | Delete a recording |

### CDRs (Call Detail Records)
| Tool | Description |
|------|-------------|
| `vobiz_voice_list_cdrs` | List CDRs with filters |
| `vobiz_voice_get_cdr` | Get a specific CDR |
| `vobiz_voice_search_cdrs` | Search CDRs |
| `vobiz_voice_recent_cdrs` | Get recent CDRs |

### Conferences
| Tool | Description |
|------|-------------|
| `vobiz_voice_get_conference` | Get conference details |
| `vobiz_voice_hangup_conference` | End a conference |
| `vobiz_voice_hangup_all_conferences` | End all conferences |

### Account & Numbers
| Tool | Description |
|------|-------------|
| `vobiz_voice_get_account` | Get account info |
| `vobiz_voice_list_numbers` | List purchased numbers |
| `vobiz_voice_list_inventory` | Browse available numbers |
| `vobiz_voice_purchase_number` | Purchase a number |
| `vobiz_voice_release_number` | Release a number |

## Slash commands

| Command | What it does |
|---------|-------------|
| `/vobiz-setup-full` | Full provisioning — trunk, credentials, origination URI, app, phone number |
| `/vobiz-setup-trunk` | Create or manage SIP trunks |
| `/vobiz-setup-credentials` | Create or manage trunk credentials |
| `/vobiz-setup-app` | Create or manage voice applications |
| `/vobiz-setup-endpoint` | Create or manage SIP endpoints (WebRTC, softphones) |
| `/vobiz-setup-origination-uri` | Create or manage origination URIs (SIP routing) |
| `/vobiz-voicexml` | Voice XML reference — build webhook responses for call flow control |

## Contributing

```bash
cd mcp-server
npm install
npm run build     # compiles TypeScript + bundles with esbuild
npm start         # runs the bundled MCP server
```

## License

MIT
