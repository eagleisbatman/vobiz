# Vobiz: Build AI Voice Agent

Build a real-time AI voice agent that connects to phone calls via Vobiz WebSocket audio streaming. The agent receives caller audio, processes it through STT + LLM + TTS, and speaks back in real-time.

## Instructions

Help the user build a complete voice AI agent that works with Vobiz. Ask which STT/LLM/TTS providers they want to use, then scaffold the full project.

### Architecture

```
Phone call (PSTN)
    |
    v
Vobiz (SIP trunk + WebSocket streaming)
    |
    v  audio/x-mulaw;rate=8000 or audio/x-l16;rate=16000
Your Agent Server
    |
    +---> STT (Deepgram / Google / Azure / Whisper)
    |       |
    |       v  text transcript
    |     LLM (Claude / GPT / Gemini)
    |       |
    |       v  response text
    +---> TTS (ElevenLabs / Google / Azure / Deepgram)
    |
    v  base64 audio back to Vobiz WebSocket
Caller hears AI response
```

### How Vobiz WebSocket streaming works

**Step 1:** Call arrives → your webhook returns Voice XML with `<Stream>`:
```xml
<Response>
  <Stream bidirectional="true" keepCallAlive="true"
    contentType="audio/x-mulaw;rate=8000">wss://your-agent.com/ws</Stream>
</Response>
```

**Step 2:** Vobiz connects to your WebSocket and sends JSON messages:

**Connected event:**
```json
{
  "event": "connected",
  "protocol": "Call",
  "version": "1.0.0"
}
```

**Start event (call metadata):**
```json
{
  "event": "start",
  "sequence_number": "1",
  "start": {
    "stream_id": "uuid",
    "call_id": "uuid",
    "from": "+919876543210",
    "to": "+914155551234",
    "codec": "audio/x-mulaw;rate=8000",
    "direction": "inbound"
  }
}
```

**Media events (continuous audio):**
```json
{
  "event": "media",
  "sequence_number": "4",
  "media": {
    "chunk": "2",
    "timestamp": "5",
    "payload": "<base64-encoded-audio-chunk>",
    "track": "inbound"
  }
}
```

**Stop event:**
```json
{
  "event": "stop",
  "sequence_number": "100",
  "stop": { "reason": "caller_hangup" }
}
```

**Step 3:** To speak back, send audio to the WebSocket:
```json
{
  "event": "playAudio",
  "media": {
    "contentType": "audio/x-mulaw",
    "sampleRate": "8000",
    "payload": "<base64-encoded-audio>"
  }
}
```

### Project structure to generate

```
<project-name>/
  package.json
  tsconfig.json
  src/
    index.ts              # Express + WebSocket server
    agent/
      pipeline.ts         # Main pipeline: STT → LLM → TTS → play
      conversation.ts     # Conversation state per CallUUID
    ws/
      handler.ts          # WebSocket message handler (connected/start/media/stop)
      audio-buffer.ts     # Accumulate audio chunks, detect speech boundaries
    stt/
      provider.ts         # STT interface + selected provider
    llm/
      provider.ts         # LLM interface + selected provider
    tts/
      provider.ts         # TTS interface + selected provider
    routes/
      answer.ts           # POST /answer — returns Voice XML with <Stream>
      hangup.ts           # POST /hangup — cleanup
    utils/
      audio.ts            # Audio format conversion (mulaw ↔ PCM ↔ provider format)
  .env.example
  railway.json
```

### Provider options

**STT (Speech-to-Text):**
| Provider | Package | Streaming | Notes |
|----------|---------|-----------|-------|
| Deepgram | `@deepgram/sdk` | Yes (WebSocket) | Best for real-time, supports interim results |
| Google Cloud STT | `@google-cloud/speech` | Yes (streaming) | Good accuracy, many languages |
| Azure Speech | `microsoft-cognitiveservices-speech-sdk` | Yes | Good for enterprise |
| OpenAI Whisper | `openai` | No (batch only) | High accuracy, higher latency |

**LLM (Language Model):**
| Provider | Package | Streaming | Notes |
|----------|---------|-----------|-------|
| Claude | `@anthropic-ai/sdk` | Yes | Best reasoning, tool use |
| OpenAI GPT | `openai` | Yes | Fast, good for conversation |
| Google Gemini | `@google/generative-ai` | Yes | Multimodal capable |

**TTS (Text-to-Speech):**
| Provider | Package | Streaming | Notes |
|----------|---------|-----------|-------|
| ElevenLabs | `elevenlabs` | Yes (WebSocket) | Most natural voices |
| Deepgram | `@deepgram/sdk` | Yes | Low latency, good quality |
| Google Cloud TTS | `@google-cloud/text-to-speech` | No (batch) | Many languages |
| Azure Speech | `microsoft-cognitiveservices-speech-sdk` | Yes | Enterprise grade |

Ask the user which providers they prefer. Default recommendation: **Deepgram STT + Claude LLM + ElevenLabs TTS** for best quality-latency balance.

### Audio format handling

Vobiz sends audio in the codec specified in `<Stream contentType="...">`:
- `audio/x-mulaw;rate=8000` — G.711 u-law, 8kHz, 8-bit (telephony standard, smallest bandwidth)
- `audio/x-l16;rate=8000` — Linear PCM, 8kHz, 16-bit signed little-endian
- `audio/x-l16;rate=16000` — Linear PCM, 16kHz, 16-bit (better quality for STT)

Most STT providers want **linear PCM 16kHz**. Generate audio conversion utilities:

```typescript
// mulaw to linear PCM
function mulawToLinear(mulawByte: number): number {
  const BIAS = 0x84;
  let sign = mulawByte & 0x80;
  let exponent = (mulawByte >> 4) & 0x07;
  let mantissa = mulawByte & 0x0f;
  let sample = ((mantissa << 3) + BIAS) << exponent;
  return sign ? -sample : sample;
}

// Upsample 8kHz to 16kHz (linear interpolation)
function upsample8to16(samples: Int16Array): Int16Array {
  const out = new Int16Array(samples.length * 2);
  for (let i = 0; i < samples.length; i++) {
    out[i * 2] = samples[i];
    out[i * 2 + 1] = i < samples.length - 1
      ? Math.round((samples[i] + samples[i + 1]) / 2)
      : samples[i];
  }
  return out;
}
```

For TTS output back to Vobiz, convert provider audio to match the stream's codec.

### Conversation management

Each call gets a conversation context tracked by `CallUUID`:

```typescript
interface Conversation {
  callId: string;
  from: string;
  to: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  systemPrompt: string;
  startedAt: Date;
}
```

### Pipeline flow

```
1. Audio chunk arrives (media event)
2. Decode base64 → convert to PCM → feed to streaming STT
3. STT emits transcript (interim or final)
4. On final transcript → send to LLM with conversation history
5. LLM streams response tokens
6. Accumulate tokens into sentence chunks (split on . ! ? or after N chars)
7. Each sentence → TTS → get audio
8. Convert TTS audio to stream codec (mulaw/l16) → base64
9. Send playAudio event back to WebSocket
10. Append user message + assistant response to conversation history
```

### Key implementation details

- **Interruption handling:** When new user speech is detected while TTS is playing, stop current TTS and process new input
- **Silence detection:** Use VAD (Voice Activity Detection) or STT endpointing to know when user finishes speaking
- **Latency optimization:** Stream everything — don't wait for full STT transcript before starting LLM, don't wait for full LLM response before starting TTS
- **Graceful shutdown:** On `stop` event, flush any pending responses and clean up provider connections
- **Error recovery:** If any provider fails, speak a fallback message ("I'm having trouble, please try again") rather than silence

### Connecting to Vobiz

After scaffolding, the user needs:

1. **Deploy the agent server** — must be publicly accessible via HTTPS with WebSocket support
2. **Create a Vobiz Application** pointing `answer_url` to `https://<deployed-url>/answer`
   - Use `/vobiz-setup-app` or `vobiz_voice_make_call` with the answer_url
3. **Make a test call** — use `vobiz_voice_make_call` with `answer_url` pointing to the deployed server

### Environment variables

```
PORT=3000
# Vobiz (for outbound calls via API)
VOBIZ_AUTH_ID=your-auth-id
VOBIZ_AUTH_TOKEN=your-auth-token
# STT
DEEPGRAM_API_KEY=your-key
# LLM
ANTHROPIC_API_KEY=your-key
# TTS
ELEVENLABS_API_KEY=your-key
ELEVENLABS_VOICE_ID=your-voice-id
# Agent
AI_SYSTEM_PROMPT="You are a helpful phone assistant..."
```

$ARGUMENTS
