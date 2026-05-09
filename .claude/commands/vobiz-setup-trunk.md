# Vobiz: Create/Manage SIP Trunk

Manage SIP trunks on the Vobiz platform. Requires `VOBIZ_AUTH_ID` and `VOBIZ_AUTH_TOKEN` environment variables.

## Instructions

When the user invokes this skill, help them create or manage a SIP trunk. Use `curl` commands to interact with the Vobiz API.

### API Details

- **Base URL:** `https://api.vobiz.ai/api/v1`
- **Auth headers:** `X-Auth-ID: $VOBIZ_AUTH_ID` and `X-Auth-Token: $VOBIZ_AUTH_TOKEN`
- **SIP Server:** `sip.vobiz.ai` (ports 5060 UDP/TCP, 5061 TLS)

### Operations

**Create trunk:**
```
POST /account/{auth_id}/trunks
```
Required: `name` (max 255 chars)
Optional: `trunk_status` (enabled/disabled), `secure` (boolean, TLS/SRTP), `trunk_direction` (outbound/both/inbound), `concurrent_calls_limit` (default 10), `cps_limit` (default 5), `transport` (udp/tcp), `credential_uuid`, `primary_uri_uuid`, `fallback_uri_uuid`, `inbound_destination`

**List/Get/Update/Delete:**
- GET `/account/{auth_id}/trunks/{trunk_id}`
- PUT `/account/{auth_id}/trunks/{trunk_id}` — updatable: name, description, enabled
- DELETE `/account/{auth_id}/trunks/{trunk_id}` — permanently removes trunk + credentials + URIs

### Workflow

1. Ask user for trunk name and direction (outbound for AI agents making calls, both for inbound+outbound)
2. Ask about encryption (recommend `secure: true` for production)
3. Create the trunk
4. Display the `trunk_id` and `trunk_domain` (format: `{trunk_id}.sip.vobiz.ai`)
5. Suggest next steps: create credentials (/vobiz-setup-credentials) and origination URIs (/vobiz-setup-origination-uri)

$ARGUMENTS
