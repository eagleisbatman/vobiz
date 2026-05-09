# Vobiz: Full Provisioning Setup

Complete end-to-end Vobiz provisioning for a new voice project. Creates trunk, credentials, origination URI, application, and optionally purchases a phone number. Requires `VOBIZ_AUTH_ID` and `VOBIZ_AUTH_TOKEN` environment variables.

## Instructions

Walk the user through the full provisioning workflow. Execute each step via `curl` commands against the Vobiz API.

### API Details

- **Base URL:** `https://api.vobiz.ai/api/v1`
- **Auth headers:** `X-Auth-ID: $VOBIZ_AUTH_ID` and `X-Auth-Token: $VOBIZ_AUTH_TOKEN`
- **Path casing:** Most paths use lowercase `/account/{auth_id}/...`, but Applications and Endpoints use `/Account/{authID}/...` per Vobiz API conventions.

### Provisioning Steps

**Step 1: Create SIP Trunk**
```
POST /account/{auth_id}/trunks
Body: { "name": "<project-name>-trunk", "trunk_direction": "both", "secure": true, "transport": "udp" }
```
Save the returned `trunk_id`.

**Step 2: Create Credentials**
```
POST /account/{auth_id}/credentials
Body: { "username": "<project-name>-user", "password": "<generated-16-char>", "description": "Credentials for <project-name>" }
```
Save `credential_id`. Remind user to store password securely — it's write-only.

**Step 3: Update trunk with credential**
```
PUT /account/{auth_id}/trunks/{trunk_id}
Body: { "credential_uuid": "<credential_id>" }
```

**Step 4: Create Origination URI**
```
POST /account/{auth_id}/origination-uris
Body: { "uri": "sip:<destination>:<port>", "priority": 1, "weight": 10 }
```
Ask the user for their SIP destination (LiveKit server, custom agent, etc).
Save `uri_id`, then update trunk: `PUT /account/{auth_id}/trunks/{trunk_id}` with `{ "primary_uri_uuid": "<uri_id>" }`.

**Step 5: Create Application** (optional — for inbound calls)
```
POST /Account/{authID}/Application/
Body: { "app_name": "<project-name>-app", "answer_url": "<user-webhook-url>", "hangup_url": "<user-hangup-url>" }
```
Save `app_id`.

**Step 6: Purchase Phone Number** (optional)
```
GET /account/{auth_id}/inventory/numbers?country=IN — list available numbers
POST /account/{auth_id}/numbers/purchase-from-inventory — purchase selected number
Body: { "e164": "+91XXXXXXXXXX" }
```

### Summary Output

After provisioning, display a summary:
```
Trunk ID:      {trunk_id}
Trunk Domain:  {trunk_id}.sip.vobiz.ai
Credential ID: {credential_id}
Username:       {username}
URI ID:        {uri_id}
App ID:        {app_id} (if created)
Phone Number:  {e164} (if purchased)
SIP Server:    sip.vobiz.ai:5060 (UDP), :5061 (TLS)
```

### Best Practices

- Use TLS (`secure: true`) in production
- Set `concurrent_calls_limit` based on expected load (default 10)
- Maintain 500-600 calls/day per number max to avoid spam classification
- Register on DLT portal for 1400/1600 series numbers (Indian regulatory compliance)
- Create a fallback origination URI at priority 2 for redundancy

$ARGUMENTS
