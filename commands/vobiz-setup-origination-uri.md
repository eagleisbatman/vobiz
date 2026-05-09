# Vobiz: Create/Manage Origination URI

Manage origination URIs that define SIP routing destinations for trunks. Requires `VOBIZ_AUTH_ID` and `VOBIZ_AUTH_TOKEN` environment variables.

## Instructions

Help the user create or manage origination URIs — the SIP endpoints where outbound calls from a trunk will be routed. Use `curl` commands.

### API Details

- **Base URL:** `https://api.vobiz.ai/api/v1`
- **Auth headers:** `X-Auth-ID: $VOBIZ_AUTH_ID` and `X-Auth-Token: $VOBIZ_AUTH_TOKEN`

### Operations

**Create origination URI:**
```
POST /account/{auth_id}/origination-uris
```
Required: `uri` (SIP destination — format: `sip:user@host:port` or `sip:host:port`)
Optional: `priority` (lower = higher priority, default 1), `weight` (higher = more traffic, default 10), `enabled` (default true)

**List origination URIs:**
```
GET /account/{auth_id}/trunks/origination-uris?limit=20&offset=0
```

**Update:**
```
PUT /account/{auth_id}/origination-uris/{uri_id}
```
All fields optional: `uri`, `priority`, `weight`, `enabled`

**Delete:**
```
DELETE /account/{auth_id}/origination-uris/{uri_id}
```
Irreversible. Docs recommend disabling instead of deleting. Maintain minimum two URIs for redundancy.

### Routing Behavior

- System attempts URIs sequentially by **priority** (lower number = tried first)
- Among equal-priority URIs, traffic is distributed proportionally by **weight** (weight 20 = 2x traffic of weight 10)
- Use for failover: primary URI at priority 1, backup at priority 2

### Common SIP URI Patterns

- LiveKit: `sip:trunk@livekit-server:5060`
- Custom agent: `sip:agent@your-server:5060`
- Failover pair: create two URIs with priority 1 and 2

$ARGUMENTS
