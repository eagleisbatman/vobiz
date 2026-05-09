# Vobiz: Scaffold Webhook Server

Scaffold a production-ready webhook server that handles Vobiz call events and returns Voice XML. The server handles inbound/outbound call flows and deploys to any Node.js hosting platform.

## Instructions

Generate a complete webhook server project for the user. Ask what kind of call flow they need, then scaffold accordingly.

### What the server does

1. Vobiz calls your `answer_url` when a call connects (inbound or outbound)
2. Your server receives POST data: `CallUUID`, `From`, `To`, `Direction`, `CallStatus`
3. Your server responds with Voice XML within 1-2 seconds
4. Vobiz executes the XML (speak, gather DTMF, dial, record, stream audio, etc.)
5. For interactive flows (Gather, Record), Vobiz POSTs results to your `action` URL — the cycle repeats

### Project structure to generate

```
<project-name>/
  package.json          # Node.js project with express, dotenv
  tsconfig.json         # TypeScript config (ES2022, Node16)
  src/
    index.ts            # Express server entry point
    routes/
      answer.ts         # POST /answer — main call handler, returns Voice XML
      hangup.ts         # POST /hangup — call completion webhook
      fallback.ts       # POST /fallback — backup handler if answer fails
      status.ts         # POST /status — stream/recording status callbacks
    xml/
      builder.ts        # Voice XML builder helpers (typed, no raw strings)
    middleware/
      validate.ts       # Validate Vobiz webhook signatures (X-Vobiz-Signature header if available)
  .env.example          # Template: PORT, VOBIZ_AUTH_ID, VOBIZ_AUTH_TOKEN
  railway.json          # Railway deployment config
```

### Voice XML builder

Generate a typed builder so users don't write raw XML strings:

```typescript
// Usage:
const xml = vobizResponse()
  .speak("Welcome! Press 1 for sales, 2 for support.", { voice: "WOMAN", language: "en-US" })
  .gather({ action: "/handle-input", inputType: "dtmf", numDigits: "1", finishOnKey: "#" })
  .speak("We didn't receive any input. Goodbye.")
  .build();
// Returns: <Response><Speak ...>...</Speak><Gather ...>...</Gather><Speak>...</Speak></Response>
```

Support these Voice XML elements in the builder:
- `speak(text, opts?)` — TTS with voice, language, loop
- `play(url, opts?)` — audio file playback with loop
- `gather(opts, ...children)` — collect DTMF/speech input
- `dial(destination, opts?)` — connect to number/SIP endpoint
- `record(opts)` — capture audio to file
- `stream(wsUrl, opts?)` — WebSocket audio streaming for AI agents
- `conference(roomName, opts?)` — join conference
- `wait(seconds)` — silent pause
- `hangup(opts?)` — end call
- `redirect(url, method?)` — transfer to new handler
- `dtmf(digits)` — send DTMF tones
- `preAnswer(...children)` — early media before answering

### Call flow templates

Based on what the user needs, generate the appropriate answer.ts:

**Simple greeting + hangup:**
```typescript
app.post("/answer", (req, res) => {
  res.type("application/xml").send(
    vobizResponse()
      .speak("Hello! This is a test call from Vobiz. Goodbye.")
      .hangup()
      .build()
  );
});
```

**IVR menu with DTMF:**
```typescript
app.post("/answer", (req, res) => {
  res.type("application/xml").send(
    vobizResponse()
      .gather({ action: "/handle-input", inputType: "dtmf", numDigits: "1" },
        vobizResponse().speak("Press 1 for sales, 2 for support, 3 to leave a message.")
      )
      .speak("We didn't receive any input. Goodbye.")
      .build()
  );
});

app.post("/handle-input", (req, res) => {
  const { Digits } = req.body;
  // Route based on input
});
```

**AI voice agent (WebSocket streaming):**
```typescript
app.post("/answer", (req, res) => {
  const wsUrl = process.env.AI_AGENT_WS_URL; // e.g. wss://your-agent.com/stream
  res.type("application/xml").send(
    vobizResponse()
      .speak("Connecting you to our AI assistant.")
      .stream(wsUrl, {
        bidirectional: true,
        keepCallAlive: true,
        contentType: "audio/x-mulaw;rate=8000"
      })
      .build()
  );
});
```

**Call transfer with announcement:**
```typescript
app.post("/answer", (req, res) => {
  res.type("application/xml").send(
    vobizResponse()
      .speak("Please hold while we transfer your call.")
      .dial("+15671234567", { callerId: "+14155551234", timeout: 30 })
      .build()
  );
});
```

**Voicemail with transcription:**
```typescript
app.post("/answer", (req, res) => {
  res.type("application/xml").send(
    vobizResponse()
      .speak("Please leave a message after the beep.")
      .record({
        action: "/recording-complete",
        maxLength: 120,
        fileFormat: "mp3",
        transcriptionType: "auto",
        transcriptionUrl: `${process.env.BASE_URL}/transcription`
      })
      .build()
  );
});
```

### Webhook POST body fields

**answer_url receives:**
| Field | Description |
|-------|-------------|
| `CallUUID` | Unique call identifier — use this to track conversation state |
| `From` | Caller number (E.164) |
| `To` | Called number (E.164) |
| `Direction` | `inbound` or `outbound` |
| `CallStatus` | `ringing`, `in-progress`, etc. |

**hangup_url receives:**
| Field | Description |
|-------|-------------|
| `CallUUID` | Call identifier |
| `CallStatus` | `completed` |
| `Duration` | Call duration in seconds |
| `HangupCause` | e.g. `NORMAL_CLEARING`, `USER_BUSY`, `NO_ANSWER` |

**Gather action_url receives:**
| Field | Description |
|-------|-------------|
| `CallUUID` | Call identifier |
| `Digits` | DTMF digits entered (if inputType includes dtmf) |
| `Speech` | Transcribed speech (if inputType includes speech) |
| `SpeechConfidenceScore` | Confidence 0-1 (if speech) |
| `InputType` | `dtmf` or `speech` |

### Deployment

Generate a `railway.json`:
```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": { "builder": "RAILPACK", "buildCommand": "npm run build" },
  "deploy": { "startCommand": "node dist/index.js" }
}
```

After scaffolding, remind the user to:
1. Create a Vobiz Application pointing to their deployed URL: `/vobiz-setup-app`
2. Or use `vobiz_voice_make_call` with `answer_url` set to their server

### Key constraints

- Response must return within 10 seconds (1-2 seconds recommended)
- Content-Type must be `application/xml`
- All XML must be wrapped in `<Response>` root element
- CallUUID is your session key — use it to maintain state across webhook cycles
- For production: use HTTPS, validate webhook source, implement retry idempotency

$ARGUMENTS
