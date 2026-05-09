# Vobiz: Create/Manage SIP Endpoint

Manage SIP endpoints for WebRTC or softphone registration. Requires `VOBIZ_AUTH_ID` and `VOBIZ_AUTH_TOKEN` environment variables.

## Instructions

Help the user create or manage SIP endpoints that register with `sip.vobiz.ai`. Use `curl` commands.

### API Details

- **Base URL:** `https://api.vobiz.ai/api/v1`
- **Auth headers:** `X-Auth-ID: $VOBIZ_AUTH_ID` and `X-Auth-Token: $VOBIZ_AUTH_TOKEN`
- **Note:** Endpoints use capital-A path: `/Account/{authID}/Endpoint/`

### Operations

**Create endpoint:**
```
POST /Account/{authID}/Endpoint/
```
Required: `username` (unique alphanumeric), `password` (min 8 chars)
Optional: `alias`, `application` (integer app ID), `allow_voice` (default true), `allow_message` (default true), `allow_video` (default false), `allow_same_domain` (default true), `allow_other_domains` (default false), `allow_phones` (default true), `allow_apps` (default true), `sub_account`

Returns: `endpoint_id`, `sip_uri` (format: `sip:username@sip.vobiz.ai`)

**List with filters:**
```
GET /Account/{authID}/Endpoint/?limit=20&offset=0
```
Filters: `username__contains`, `username__exact`, `username__startswith`, `alias__contains`, `alias__exact`, `application_id__exact`, `application_id__isnull`, `sub_account`

**Update (limited fields):**
```
POST /Account/{authID}/Endpoint/{endpointID}/
```
Updatable: `password`, `alias`, `application`, `allow_voice`, `allow_message`, `allow_video`
Locked: `username`, `endpoint_id`, `domain`, `allow_same_domain`, `allow_other_domains`, `allow_phones`, `allow_apps`

**Delete:**
```
DELETE /Account/{authID}/Endpoint/{endpointID}/
```
Permanent. All registered devices disconnect immediately.

### Workflow

1. Ask user for a unique username and a strong password (min 8 chars, 12+ recommended)
2. Ask if this endpoint should be linked to a specific application (pass app ID)
3. Create the endpoint
4. Display the returned `endpoint_id` and `sip_uri` (format: `sip:username@sip.vobiz.ai`)
5. Suggest testing registration with a SIP client, WebRTC browser app, or softphone

### WebRTC Config

- WebRTC endpoint: `wss://sip.vobiz.ai:7443`
- Auth: JWT-based via the endpoint credentials
- Useful for browser-based voice agents

$ARGUMENTS
