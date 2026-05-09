# Vobiz MCP Server & Claude Code Skills

MCP server and Claude Code skills for the [Vobiz](https://www.vobiz.ai/) voice/telephony platform. Use these tools to manage calls, audio streams, recordings, and phone numbers from any AI agent or coding assistant.

## Quick Start

### Prerequisites

1. A [Vobiz](https://www.vobiz.ai/) account with API credentials
2. Node.js >= 20

### Set your credentials

```bash
export VOBIZ_AUTH_ID="your-auth-id"
export VOBIZ_AUTH_TOKEN="your-auth-token"
```

### Use with Claude Code

Add to your project's `.mcp.json`:

```json
{
  "mcpServers": {
    "vobiz-voice": {
      "command": "npx",
      "args": ["-y", "vobiz-mcp"]
    }
  }
}
```

Or register globally (works across all projects):

```bash
claude mcp add vobiz-voice -- npx -y vobiz-mcp
```

### Use with any MCP client

```bash
npx vobiz-mcp
```

The server communicates over stdio using the [Model Context Protocol](https://modelcontextprotocol.io/).

## MCP Tools (31)

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

## Claude Code Skills

Clone this repo to get provisioning skills as slash commands in Claude Code:

| Command | Description |
|---------|-------------|
| `/vobiz-setup-full` | Full end-to-end provisioning (trunk, credentials, URI, app, number) |
| `/vobiz-setup-trunk` | Create/manage SIP trunks |
| `/vobiz-setup-credentials` | Create/manage trunk credentials |
| `/vobiz-setup-app` | Create/manage applications |
| `/vobiz-setup-endpoint` | Create/manage SIP endpoints |
| `/vobiz-setup-origination-uri` | Create/manage origination URIs |
| `/vobiz-voicexml` | Voice XML reference and builder |

## Project Structure

```
mcp-server/          # MCP server (npm package: vobiz-mcp)
  src/
    index.ts         # Entry point
    client.ts        # Vobiz API HTTP client
    tools/           # Tool modules (calls, audio, streams, etc.)
.claude/commands/    # Claude Code skills for provisioning
raw/                 # Source API documentation (reference only)
```

## Development

```bash
cd mcp-server
npm install
npm run build
npm start
```

## License

MIT
