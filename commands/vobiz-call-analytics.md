# Vobiz: Call Analytics

Analyze call data from your Vobiz account. Uses the CDR (Call Detail Record) MCP tools to generate insights about call patterns, costs, quality, and agent performance.

## Instructions

Help the user analyze their call data using the Vobiz MCP tools. Ask what they want to understand, then pull the right data and present insights.

### Available data sources

Use these MCP tools to pull data — do NOT use curl or direct API calls:

| Tool | Use for |
|------|---------|
| `vobiz_voice_list_cdrs` | Paginated CDR list with filters (date, direction, number, duration) |
| `vobiz_voice_search_cdrs` | Same filters + returns `filter_summary` with aggregates |
| `vobiz_voice_recent_cdrs` | Quick grab of most recent calls |
| `vobiz_voice_export_cdrs` | Full CSV export for large datasets |
| `vobiz_voice_get_cdr` | Single call deep-dive |
| `vobiz_voice_get_account` | Account balance, limits, pricing tier |
| `vobiz_voice_list_numbers` | Phone numbers and their status |
| `vobiz_voice_list_recordings` | Call recordings with metadata |

### CDR fields available for analysis

| Field | Type | Description |
|-------|------|-------------|
| `call_uuid` | string | Unique call ID |
| `from_number` | string | Caller number |
| `to_number` | string | Destination number |
| `call_direction` | string | `inbound` or `outbound` |
| `call_duration` | number | Duration in seconds |
| `billed_duration` | number | Billable seconds |
| `total_amount` | number | Cost of the call |
| `hangup_cause` | string | Why the call ended |
| `hangup_source` | string | Who hung up (caller, callee, API, system) |
| `initiation_time` | string | When call was initiated |
| `answer_time` | string | When call was answered (null if not) |
| `end_time` | string | When call ended |

### Analysis types

**1. Call volume dashboard:**
- Total calls by day/week/month
- Inbound vs outbound split
- Peak hours and busiest days
- Calls per phone number

**2. Cost analysis:**
- Total spend by period
- Average cost per call
- Cost by direction (inbound vs outbound)
- Cost by destination (number/region)
- Projected monthly spend based on current rate

**3. Quality metrics:**
- Answer rate (answered calls / total calls)
- Average call duration
- Hangup cause distribution (NORMAL_CLEARING vs USER_BUSY vs NO_ANSWER etc.)
- Short calls (<10s) — may indicate issues
- Failed call rate

**4. Number utilization:**
- Calls per phone number
- Numbers with no activity (waste)
- Numbers approaching 500-600 calls/day spam threshold

**5. Pattern detection:**
- Unusual spike/drop in volume
- Repeated failed calls to same number
- Calls outside business hours
- Long-duration outliers

### How to analyze

**Step 1: Pull data.** Use the right tool based on scope:
- Quick overview → `vobiz_voice_recent_cdrs` with limit
- Date range → `vobiz_voice_list_cdrs` or `vobiz_voice_search_cdrs` with start_date/end_date
- Full export → `vobiz_voice_export_cdrs` for CSV

**Step 2: Process.** Calculate metrics from the CDR data. Present results in tables and summaries.

**Step 3: Insights.** Don't just show numbers — interpret them:
- "Your answer rate is 67% — 33% of calls go unanswered. Consider adding a voicemail fallback."
- "You're spending INR 2,340/day on outbound calls. At this rate, monthly cost will be ~INR 70,200."
- "Number +919876543210 has 480 calls today — approaching the 500-600/day spam threshold."

### Output formats

**Summary report (default):**
```
Call Analytics — May 1-9, 2026
─────────────────────────────
Total calls:      1,247
  Inbound:        823 (66%)
  Outbound:       424 (34%)
Answer rate:      78.4%
Avg duration:     2m 34s
Total cost:       INR 18,450

Top hangup causes:
  NORMAL_CLEARING    72%
  NO_ANSWER          15%
  USER_BUSY           8%
  ORIGINATOR_CANCEL   5%

Busiest hours: 10:00-12:00 IST
Quietest hours: 22:00-06:00 IST
```

**Script generation:** If the user wants ongoing analytics, generate a Node.js/Python script that pulls CDRs via the Vobiz API and outputs metrics. Include the API calls with proper auth headers.

**CSV for spreadsheet:** Use `vobiz_voice_export_cdrs` and help the user create pivot tables or charts.

### Alerts and recommendations

Based on the data, proactively flag:
- Numbers nearing spam threshold (>400 calls/day)
- Answer rate below 70%
- Cost spikes (>2x daily average)
- High rate of NO_ANSWER or USER_BUSY (routing issues)
- Calls with 0s duration (signaling failures)
- Account balance running low relative to daily spend

$ARGUMENTS
