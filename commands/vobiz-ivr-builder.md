# Vobiz: Build IVR System

Design and generate a complete IVR (Interactive Voice Response) system with menu trees, DTMF routing, speech input, call transfers, voicemail, and business-hours logic. Outputs a deployable webhook server with all routes.

## Instructions

Walk the user through designing their IVR call flow, then generate the complete server code. Ask about their menu structure, business hours, and routing rules.

### Design process

**Step 1: Gather requirements.** Ask the user:
- What is the greeting callers hear?
- How many menu levels? (e.g. "Press 1 for sales, 2 for support" → sub-menus?)
- Where do calls route? (phone numbers, SIP endpoints, queues, voicemail)
- Do you need business hours logic? (different flows for open/closed/holiday)
- Do you need speech input or just DTMF?
- What language(s)?
- Do you need call recording?
- What happens on timeout (no input)?

**Step 2: Draw the flow tree.** Represent the IVR as a tree before generating code:

```
Incoming call
  ├─ [Business hours check]
  │   ├─ Open → Main Menu
  │   └─ Closed → After-hours message → Voicemail
  │
  Main Menu: "Press 1 for sales, 2 for support, 3 for billing"
    ├─ 1 → Sales
    │   ├─ Transfer to +1555... (sales team)
    │   └─ No answer → Voicemail (sales)
    ├─ 2 → Support
    │   ├─ Sub-menu: "Press 1 for technical, 2 for account issues"
    │   │   ├─ 1 → Transfer to +1555... (tech support)
    │   │   └─ 2 → Transfer to +1555... (account team)
    │   └─ No input → Repeat menu (max 3 times) → Voicemail
    ├─ 3 → Billing
    │   └─ Transfer to +1555... (billing)
    ├─ 0 → Operator
    └─ timeout/invalid → Repeat menu → Goodbye
```

**Step 3: Generate the server.** Use the webhook server pattern from `/vobiz-webhook-server`.

### IVR route pattern

Each menu level is a separate route. Gather sends input to the next route:

```typescript
// Main menu
app.post("/answer", (req, res) => {
  res.type("application/xml").send(
    vobizResponse()
      .gather({ action: "/menu/main", inputType: "dtmf", numDigits: "1", executionTimeout: "8" },
        vobizResponse().speak("Welcome to Acme Corp. Press 1 for sales, 2 for support, 3 for billing. Press 0 for an operator.")
      )
      .redirect("/menu/timeout")
      .build()
  );
});

// Handle main menu input
app.post("/menu/main", (req, res) => {
  const digit = req.body.Digits;
  switch (digit) {
    case "1":
      res.type("application/xml").send(
        vobizResponse()
          .speak("Connecting you to sales.")
          .dial("+15551234567", { callerId: req.body.To, timeout: 30 })
          .redirect("/voicemail/sales")  // fallback if no answer
          .build()
      );
      break;
    case "2":
      res.type("application/xml").send(
        vobizResponse()
          .gather({ action: "/menu/support", inputType: "dtmf", numDigits: "1" },
            vobizResponse().speak("Press 1 for technical support, 2 for account issues.")
          )
          .redirect("/menu/timeout")
          .build()
      );
      break;
    // ... more options
    default:
      res.type("application/xml").send(
        vobizResponse()
          .speak("Invalid selection.")
          .redirect("/answer")
          .build()
      );
  }
});
```

### Business hours logic

Generate a business hours module:

```typescript
interface BusinessHours {
  timezone: string;              // e.g. "Asia/Kolkata"
  schedule: Record<string, { open: string; close: string } | null>;
  // null = closed that day. e.g. { monday: { open: "09:00", close: "18:00" }, sunday: null }
  holidays: string[];            // ISO dates: ["2026-01-26", "2026-08-15"]
}

function isOpen(config: BusinessHours): boolean {
  // Check holiday list, then day-of-week schedule
}
```

Route the call based on business hours:

```typescript
app.post("/answer", (req, res) => {
  if (isOpen(businessHours)) {
    // Normal IVR menu
    res.type("application/xml").send(mainMenuXml());
  } else {
    // After-hours message + voicemail
    res.type("application/xml").send(
      vobizResponse()
        .speak("Thank you for calling. Our office is currently closed. Please leave a message after the beep.")
        .record({ action: "/voicemail/general", maxLength: 120, fileFormat: "mp3", playBeep: "true" })
        .build()
    );
  }
});
```

### Voicemail handling

```typescript
app.post("/voicemail/:dept", (req, res) => {
  const { CallUUID, RecordUrl, RecordingDuration, From } = req.body;
  // Store voicemail metadata, notify team via email/Slack/webhook
  console.log(`Voicemail from ${From} (${RecordingDuration}s): ${RecordUrl}`);
  res.type("application/xml").send(
    vobizResponse()
      .speak("Thank you. Your message has been recorded. Goodbye.")
      .hangup()
      .build()
  );
});
```

### Call recording

To record the entire call, add recording params to `<Dial>`:

```xml
<Dial callbackUrl="https://your-server/recording-status" record="true" recordFileFormat="mp3">
  <Number>+15551234567</Number>
</Dial>
```

Or use the Vobiz API tool `vobiz_voice_start_stream` for real-time monitoring.

### Advanced features

**Speech input (instead of DTMF):**
```xml
<Gather action="/handle-speech" inputType="speech" language="en-US"
  speechModel="phone_call" speechEndTimeout="2" executionTimeout="10">
  <Speak>How can I help you today?</Speak>
</Gather>
```
The callback receives `Speech` (transcribed text) and `SpeechConfidenceScore`.

**Retry logic (max attempts):**
Track attempts via query params in action URLs:
```typescript
app.post("/menu/main", (req, res) => {
  const attempt = parseInt(req.query.attempt as string || "1");
  if (attempt > 3) {
    return res.type("application/xml").send(
      vobizResponse().speak("Goodbye.").hangup().build()
    );
  }
  // ... menu with action="/menu/handle?attempt=${attempt}"
});
```

**Queue music / hold:**
```xml
<Dial dialMusic="real">
  <Number>+15551234567</Number>
</Dial>
```
Use `dialMusic="real"` for ringtone, or a URL for custom hold music.

### Project structure

```
<project-name>/
  package.json
  tsconfig.json
  src/
    index.ts                # Express entry point
    config/
      business-hours.ts     # Hours, holidays, timezone
      menu-tree.ts          # Menu structure as data (easy to modify)
      departments.ts        # Department names → phone numbers
    routes/
      answer.ts             # Entry point, business hours check
      menu.ts               # All menu handlers (/menu/main, /menu/support, etc.)
      voicemail.ts          # Voicemail recording handlers
      recording.ts          # Recording status callbacks
      hangup.ts             # Call completion logging
    xml/
      builder.ts            # Voice XML builder
    utils/
      business-hours.ts     # isOpen() check
  .env.example
  railway.json
```

### After scaffolding

1. Deploy the server (Railway, Render, any Node.js host)
2. Create a Vobiz Application: `/vobiz-setup-app` with `answer_url` pointing to `https://<deployed>/answer`
3. Assign a phone number to the application
4. Test with `vobiz_voice_make_call` or dial the assigned number

$ARGUMENTS
