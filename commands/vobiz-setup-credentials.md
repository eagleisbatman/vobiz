# Vobiz: Create/Manage Trunk Credentials

Manage SIP authentication credentials for Vobiz trunks. Requires `VOBIZ_AUTH_ID` and `VOBIZ_AUTH_TOKEN` environment variables.

## Instructions

Help the user create or manage SIP credentials for digest authentication. Use `curl` commands.

### API Details

- **Base URL:** `https://api.vobiz.ai/api/v1`
- **Auth headers:** `X-Auth-ID: $VOBIZ_AUTH_ID` and `X-Auth-Token: $VOBIZ_AUTH_TOKEN`

### Operations

**Create credential:**
```
POST /account/{auth_id}/credentials
```
Required: `username` (unique, immutable after creation), `password` (min 8 chars, 12+ recommended, write-only — never returned)
Optional: `enabled` (default true), `description`

**List credentials:**
```
GET /account/{auth_id}/trunks/credentials?limit=20&offset=0
```

**Update credential:**
```
PUT /account/{auth_id}/credentials/{credential_id}
```
Updatable: `password`, `enabled`, `description`. Username cannot be changed.

**Delete credential:**
```
DELETE /account/{auth_id}/credentials/{credential_id}
```
Permanently removes. Disconnects active calls using this credential.

### Workflow

1. Generate a strong username and password (recommend 16+ char alphanumeric password)
2. Create the credential
3. Store the credential_id — it's needed to associate with a trunk
4. Remind user: password is write-only and never returned in API responses — save it securely
5. If a trunk_id is provided, update the trunk to set `credential_uuid` to the new credential ID

### Security Notes

- Never log or display passwords after creation
- Recommend rotating credentials periodically
- Duplicate usernames return 409 Conflict

$ARGUMENTS
