# Vobiz: Voice XML Builder

Generate Voice XML for Vobiz call flow control. Voice XML is returned by your webhook in response to call events.

## Instructions

Help the user build Voice XML responses for their Vobiz application webhooks. All XML must be wrapped in `<Response>`.

### How It Works

1. Call event triggers webhook to your answer_url
2. Vobiz POSTs: `CallUUID`, `From`, `To`, `Direction`, `CallStatus`
3. Your server returns XML within 1-2 seconds
4. Vobiz executes elements sequentially
5. Elements with `action` URLs trigger new webhooks (cycle repeats)

XML is stateless — track conversations via `CallUUID`.

### Available Elements

**Speak** — Text-to-speech
```xml
<Speak voice="WOMAN|MAN" language="en-US" loop="1">Text here</Speak>
```
Languages: en-US, en-GB, en-AU, es-ES, es-US, fr-FR, fr-CA, pt-PT, pt-BR, da-DK, nl-NL, de-DE, it-IT, pl-PL, ru-RU, sv-SE, zh-CN, ja-JP, ar-SA, hi-IN

**Play** — Audio file playback
```xml
<Play loop="1">https://example.com/audio.mp3</Play>
```

**Gather** — Collect DTMF or speech input
```xml
<Gather action="https://..." inputType="dtmf|speech|dtmf speech" numDigits="1" finishOnKey="#">
  <Speak>Press 1 for sales</Speak>
</Gather>
```
Key attrs: `executionTimeout` (5-60s), `digitEndTimeout`, `speechEndTimeout`, `speechModel` (default/command_and_search/phone_call/telephony), `language`, `profanityFilter`

Callback sends: `InputType`, `Digits`, `Speech`, `SpeechConfidenceScore`

**Dial** — Connect to number or SIP endpoint
```xml
<Dial callerId="14155551234" timeout="30" timeLimit="14400">
  <Number sendDigits="wwww2410">15671234567</Number>
  <User sipHeaders="X-VH-Key=value">sip:alice@sip.vobiz.ai</User>
</Dial>
```
Key attrs: `hangupOnStar`, `confirmSound`, `confirmKey`, `dialMusic` ("real" for ringtone), `callbackUrl`, `digitsMatch`, `sipHeaders`

**Record** — Capture audio
```xml
<Record action="https://..." maxLength="120" fileFormat="mp3|wav"
  transcriptionType="auto|hybrid" transcriptionUrl="https://..." playBeep="true"/>
```

**Stream** — WebSocket audio streaming (for AI agents)
```xml
<Stream bidirectional="true" keepCallAlive="true"
  contentType="audio/x-l16;rate=16000"
  statusCallbackUrl="https://...">wss://your-server/stream</Stream>
```
Key attrs: `audioTrack` (inbound/outbound/both), `streamTimeout` (default 86400s), `extraHeaders`

**Conference** — Join conference room
```xml
<Conference>RoomName</Conference>
```

**Wait** — Silent pause
```xml
<Wait length="5" silence="false"/>
```

**Hangup** — End call
```xml
<Hangup reason="busy|rejected" schedule="5"/>
```

**Redirect** — Transfer to new URL
```xml
<Redirect method="POST">https://new-handler.com</Redirect>
```

**DTMF** — Send digits
```xml
<DTMF async="true">1234wW#</DTMF>
```
`w` = 0.5s delay, `W` = 1s delay

**PreAnswer** — Early media before answering
```xml
<PreAnswer><Speak>Please wait</Speak></PreAnswer>
```

### Common Patterns

**IVR Menu:**
```xml
<Response>
  <Gather action="https://app.com/handle-input" inputType="dtmf" numDigits="1">
    <Speak>Press 1 for sales, 2 for support</Speak>
  </Gather>
  <Speak>We didn't receive any input. Goodbye.</Speak>
</Response>
```

**AI Voice Agent (WebSocket):**
```xml
<Response>
  <Stream bidirectional="true" keepCallAlive="true"
    contentType="audio/x-mulaw;rate=8000">wss://your-agent.com/stream</Stream>
</Response>
```

**Call Transfer:**
```xml
<Response>
  <Speak>Transferring your call now.</Speak>
  <Dial callerId="14155551234" timeout="30">
    <Number>15671234567</Number>
  </Dial>
</Response>
```

**Voicemail:**
```xml
<Response>
  <Speak>Please leave a message after the beep.</Speak>
  <Record action="https://app.com/recording" maxLength="120" fileFormat="mp3"
    transcriptionType="auto" transcriptionUrl="https://app.com/transcription"/>
</Response>
```

$ARGUMENTS
