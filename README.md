# Vobiz — Claude Code Plugin

Claude Code plugin for the [Vobiz](https://www.vobiz.ai/) voice/telephony platform. Includes an MCP server (31 tools) for managing calls, audio, streams, and recordings, plus provisioning skills for setting up trunks, credentials, and endpoints.

## Install

### From the marketplace (recommended)

In Claude Code, add the marketplace and install:

```bash
claude plugin marketplace add eagleisbatman/vobiz
```

```
/plugin install vobiz
```

That's it — 31 MCP tools + 7 slash commands, ready to use.

### Authentication

Set these environment variables before launching Claude Code:

```bash
export VOBIZ_AUTH_ID="your-auth-id"
export VOBIZ_AUTH_TOKEN="your-auth-token"
```

Get credentials from your [Vobiz dashboard](https://www.vobiz.ai/).

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

## Slash Commands

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
.claude-plugin/
  plugin.json        # Plugin manifest
commands/            # Slash commands (provisioning skills)
mcp-server/
  src/               # TypeScript source
  dist/bundle.cjs    # Bundled server (zero dependencies)
raw/                 # Source API documentation (reference)
```

## Development

```bash
cd mcp-server
npm install
npm run build        # TypeScript compile + esbuild bundle
npm start            # Run the bundled server
```

## License

MIT
