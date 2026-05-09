# Vobiz: Create/Manage Application

Manage Vobiz voice applications that control call flow via webhook URLs. Requires `VOBIZ_AUTH_ID` and `VOBIZ_AUTH_TOKEN` environment variables.

## Instructions

Help the user create or manage a Vobiz Application — the entity that links phone numbers to webhook handlers. Use `curl` commands.

### API Details

- **Base URL:** `https://api.vobiz.ai/api/v1`
- **Auth headers:** `X-Auth-ID: $VOBIZ_AUTH_ID` and `X-Auth-Token: $VOBIZ_AUTH_TOKEN`
- **Note:** Applications use capital-A path: `/Account/{authID}/Application/`

### Operations

**Create application:**
```
POST /Account/{authID}/Application/
```
Required: `app_name` (alphanumeric, hyphens, underscores), `answer_url` (URL returning Voice XML)
Optional: `answer_method` (GET/POST, default POST), `hangup_url`, `hangup_method`, `fallback_answer_url`, `fallback_method`, `message_url`, `message_method`, `default_number_app` (boolean), `default_endpoint_app` (boolean), `application_type` (e.g. "voice")

**Get/Update/Delete:**
- GET `/Account/{authID}/Application/{appID}/`
- POST `/Account/{authID}/Application/{appID}/` — update (all fields optional except app_name; sub_account immutable)
- DELETE `/Account/{authID}/Application/{appID}/` — fails with 409 if linked to phone numbers

### Webhook Callbacks

**Answer URL** receives: `CallUUID`, `From`, `To`, `Direction`, `CallStatus`. Must respond within 10 seconds with valid Voice XML.

**Hangup URL** receives: `CallUUID`, `CallStatus`, `Duration`, `HangupCause`.

### Workflow

1. Ask user for the application name and answer_url
2. Recommend setting a hangup_url for call completion tracking
3. Recommend setting a fallback_answer_url for resilience
4. Create the application
5. Display the `app_id` for use in number/endpoint assignment
6. If the user wants this as the default app, set `default_number_app: true`

$ARGUMENTS
