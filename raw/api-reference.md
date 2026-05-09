# Vobiz API Reference

Complete API documentation scraped from https://www.docs.vobiz.ai/ on 2026-05-09.

---

## Table of Contents

1. [Overview & Authentication](#overview--authentication)
2. [Error Codes](#error-codes)
3. [Account](#account)
4. [Sub-Accounts](#sub-accounts)
5. [Applications](#applications)
6. [Phone Numbers](#phone-numbers)
7. [SIP Trunks](#sip-trunks)
8. [Trunk Credentials](#trunk-credentials)
9. [Origination URIs](#origination-uris)
10. [Endpoints (SIP)](#endpoints-sip)
11. [Calls](#calls)
12. [Call Recording (API)](#call-recording-api)
13. [Call Play Audio](#call-play-audio)
14. [Call Speak Text (TTS)](#call-speak-text-tts)
15. [Call DTMF](#call-dtmf)
16. [Audio Streams (WebSocket)](#audio-streams-websocket)
17. [Recordings](#recordings)
18. [CDR (Call Detail Records)](#cdr-call-detail-records)
19. [Conferences](#conferences)
20. [Voice XML Reference](#voice-xml-reference)

---

## Overview & Authentication

### Base URL

```
https://api.vobiz.ai/api/v1
```

Most endpoints follow the pattern:

```
https://api.vobiz.ai/api/v1/Account/{auth_id}/...
```

### Authentication

All API requests require two headers:

| Header | Description |
|--------|-------------|
| `X-Auth-ID` | Your account identifier (e.g., `MA_XXXXXXXX`) |
| `X-Auth-Token` | Your account authentication token |
| `Content-Type` | `application/json` (for POST/PUT requests) |

Credentials are displayed on the Vobiz console dashboard after sign-up.

### Platform Overview

Vobiz is a developer platform offering:
- **SIP Trunking**: Telephony-layer signaling routing calls through PSTN to AI platforms (LiveKit, VAPI, Retell AI, ElevenLabs)
- **WebSocket Streaming**: Application-layer audio delivery (G.711 u-law) for Pipecat, Bolna.ai, Ultravox, custom Python
- **Voice XML Applications**: Webhook-based call flow control
- **Phone Numbers**: DIDs filtered by region (79, 80, 22, 11 series; 1400/1600 for compliance)
- **Call Management**: Make, transfer, record, conference
- **CDR**: Detailed call logs and transaction history

### Pricing

- **SIP Trunking**: INR 0.45/min + INR 500/month per DID + platform fees
- **WebSocket Streaming**: INR 0.65/min + INR 500/month per DID + direct API costs

### Best Practices

- Maintain 500-600 calls/day per number maximum
- Rotate DIDs to prevent spam classification
- Use HTTPS for all callbacks; verify signatures
- Implement retry logic with exponential backoff
- Register on DLT portal for 1400/1600 series compliance

---

## Error Codes

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Successful request with data |
| 201 | Created - Resource successfully created |
| 204 | No Content - Successful request, no body returned |
| 400 | Bad Request - Invalid format or parameters |
| 401 | Unauthorized - Missing/invalid credentials |
| 402 | Payment Required - Insufficient account balance |
| 403 | Forbidden - Lacks permission for resource |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Request conflicts with current state |
| 422 | Unprocessable Entity - Validation failed |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |
| 502 | Bad Gateway - Downstream service unavailable |
| 503 | Service Unavailable |
| 504 | Gateway Timeout |

### Named Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_CREDENTIALS` | 401 | Email/password incorrect |
| `TOKEN_EXPIRED` | 401 | Access token needs refresh |
| `ACCOUNT_INACTIVE` | 403 | Account deactivated |
| `TRUNK_NOT_FOUND` | 404 | Trunk ID doesn't exist |
| `DUPLICATE_USERNAME` | 409 | Username already taken |
| `INSUFFICIENT_BALANCE` | 402 | Balance too low for operation |
| `PAYMENT_FAILED` | 402 | Payment gateway declined |
| `RATE_LIMIT_EXCEEDED` | 429 | CPS or request limits exceeded |
| `VALIDATION_ERROR` | 422 | Field-level validation failures |

### Error Response Format

```json
{
  "status": 400,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Description of the error"
  },
  "timestamp": "2025-01-15T10:30:45Z",
  "requestId": "uuid"
}
```

---

## Account

### Account Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (e.g., "MA_XXXXXX") |
| `api_id` | string | Internal API reference identifier |
| `name` | string | Account or company name |
| `email` | string | Associated email address |
| `phone` | string | Primary phone number |
| `type` | string | Account classification: `MASTER`, `SUB_ACCOUNT` |
| `auth_id` | string | Authentication identifier for API requests |
| `auth_secret` | string | Secret key (only shown in secure contexts) |
| `auth_token_expire_time` | string | ISO 8601 token expiration timestamp |
| `description` | string/null | Optional account notes |
| `company` | string | Legal company name |
| `address` | string | Physical street address |
| `city` | string | City location |
| `state` | string | State/province |
| `zip_code` | string | Postal code |
| `country` | string/null | Country designation |
| `timezone` | string | Local timezone (e.g., "America/Los_Angeles") |
| `account_type` | string | Billing model: `PREPAID`, `POSTPAID` |
| `postpaid` | boolean | Postpaid billing status |
| `auto_recharge` | boolean | Auto-recharge activation |
| `enabled` | boolean | Service enablement status |
| `is_active` | boolean | Current account activity |
| `is_verified` | boolean | Identity verification status |
| `is_trial_account` | boolean | Trial account indicator |
| `role` | string | User role: `ADMIN`, `USER` |
| `carrier_type` | string | Carrier service type: `VOIP`, `PSTN` |
| `customer_type` | string | Customer classification: `ENTERPRISE`, `SMB` |
| `credit_limit` | string | Maximum postpaid credit |
| `cps_limit` | number | Current calls-per-second limit |
| `concurrent_calls_limit` | number | Maximum simultaneous calls |
| `base_cps_limit` | number | Base CPS before add-ons |
| `base_concurrent_calls_limit` | number | Base concurrent calls before add-ons |
| `purchased_cps` | number | Additional CPS capacity |
| `purchased_concurrent_calls` | number | Additional concurrent call capacity |
| `risk_rating` | string | Risk assessment: `LOW`, `MEDIUM` |
| `risk_status` | string | Current risk state: `NORMAL`, `FLAGGED` |
| `ip_auth_enabled` | boolean | IP authentication activation |
| `ip_whitelist_rules` | array | Allowed IP addresses/CIDR blocks |
| `allow_aws_ips` | boolean | AWS IP range permission |
| `features` | object | Enabled features mapping (call_queue, transcription_enabled) |
| `limits` | object | Limit configuration object |
| `pricing_tier_id` | string | Associated pricing tier identifier |
| `pricing_tier` | object | Pricing configuration (see below) |
| `created_at` | string | ISO 8601 creation timestamp |
| `updated_at` | string | ISO 8601 last modification timestamp |
| `last_login` | string | ISO 8601 most recent login timestamp |

#### Pricing Tier Object (nested)

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Tier designation |
| `description` | string | Plan overview |
| `rate_per_minute` | number | Call cost per minute |
| `billing_increment_seconds` | number | Billing granularity unit |
| `minimum_duration_seconds` | number | Minimum billable call duration |
| `currency` | string | Billing currency code |

### Retrieve Account Details

**GET** `https://api.vobiz.ai/api/v1/auth/me`

No request parameters required.

**Response (200 OK):** Returns the complete Account object.

```bash
curl -X GET https://api.vobiz.ai/api/v1/auth/me \
  -H "X-Auth-ID: YOUR_AUTH_ID" \
  -H "X-Auth-Token: YOUR_AUTH_TOKEN"
```

---

## Sub-Accounts

### Sub-Account Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (e.g., "SA_67401KW8") |
| `name` | string | Subaccount display name |
| `description` | string/null | Purpose or usage details |
| `permissions` | object | Access control object |
| `permissions.calls` | boolean | Authorization for making/receiving calls |
| `permissions.cdr` | boolean | Access to Call Detail Records |
| `rate_limit` | integer | API request throttle per time period |
| `parent_auth_id` | string | Parent account ID reference |
| `auth_id` | string | API authentication credential |
| `is_active` | boolean | Operational status for API calls |
| `created_at` | string | ISO 8601 creation timestamp |
| `updated_at` | string | ISO 8601 last modification timestamp |
| `last_used` | string/null | ISO 8601 last API activity timestamp |

### Create Subaccount

**POST** `https://api.vobiz.ai/api/v1/accounts/{auth_id}/sub-accounts/`

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Human-readable subaccount name |
| `email` | string | Yes | Associated email address |
| `phone` | string | No | Associated phone number |
| `description` | string | No | Purpose or usage details |
| `rate_limit` | integer | Yes | API requests per time period |
| `permissions` | object | Yes | Access control (e.g., `{"calls": true, "cdr": true}`) |
| `password` | string | Yes | Authentication password |
| `enabled` | boolean | No | Active status flag |

**Response (201 Created):**

Returns three key sections:
- `sub_account`: Full subaccount object with metadata
- `auth_credentials`: The `auth_id` and `auth_token` (generated once only)
- `tokens`: JWT access/refresh tokens with 1800-second expiration

**IMPORTANT:** The `auth_token` is only returned once during creation. Store it securely.

### Retrieve Subaccount

**GET** `https://api.vobiz.ai/api/v1/accounts/{auth_id}/sub-accounts/{sub_auth_id}`

No request body required.

**Response (200 OK):**

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Subaccount name |
| `email` | string | Contact email |
| `phone` | string | Contact phone |
| `description` | string | Account purpose |
| `permissions` | object | Access controls (calls, cdr) |
| `rate_limit` | integer | API rate limit |
| `id` | string | Subaccount identifier |
| `auth_id` | string | Authentication ID |
| `auth_token` | string | Authentication token |
| `enabled` | boolean | Account status |
| `is_active` | boolean | Active status |
| `created` | string | ISO 8601 creation timestamp |
| `modified` | string | ISO 8601 modification timestamp |
| `resource_uri` | string | API resource endpoint |

```bash
curl -X GET 'https://api.vobiz.ai/api/v1/accounts/{auth_id}/sub-accounts/{sub_auth_id}' \
--header 'X-Auth-ID: {auth_id}' \
--header 'X-Auth-Token: {auth_token}'
```

### Update Subaccount

**PUT** `https://api.vobiz.ai/api/v1/accounts/{auth_id}/sub-accounts/{sub_auth_id}`

**Request Parameters (all optional):**

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Sub-account name |
| `email` | string | Email address |
| `phone` | string | Phone number |
| `description` | string | Purpose or usage description |
| `rate_limit` | integer | API rate limit |
| `permissions` | object | Access controls (calls, cdr) |
| `enabled` | boolean | Active status |

Parameters not provided remain unchanged.

**Response (200 OK):** Returns the complete updated sub-account object.

### Delete Subaccount

**DELETE** `https://api.vobiz.ai/api/v1/accounts/{auth_id}/sub-accounts/{sub_auth_id}`

No request body required. Permanently deletes the subaccount (irreversible).

**Response (200 OK):**

```json
{
  "message": "Sub-account deleted successfully"
}
```

### List All Subaccounts

**GET** `https://api.vobiz.ai/api/v1/accounts/{auth_id}/sub-accounts/`

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `size` | integer | 25 | Results per page |
| `active_only` | boolean | - | Filter to active sub-accounts only |

**Response (200 OK):**

```json
{
  "sub_accounts": [
    {
      "name": "string",
      "email": "string",
      "phone": "string",
      "description": "string",
      "permissions": { "calls": true, "cdr": true },
      "rate_limit": 500,
      "id": "string",
      "auth_id": "string",
      "auth_token": "string",
      "is_active": true,
      "created": "ISO 8601",
      "resource_uri": "string"
    }
  ],
  "total": 10,
  "page": 1,
  "size": 25
}
```

```bash
curl -X GET 'https://api.vobiz.ai/api/v1/accounts/{auth_id}/sub-accounts/?page=1&size=25&active_only=true' \
--header 'X-Auth-ID: {auth_id}' \
--header 'X-Auth-Token: {auth_token}'
```

---

## Applications

### Application Object

| Field | Type | Description |
|-------|------|-------------|
| `app_id` | string | Unique application identifier |
| `app_name` | string | Human-readable name |
| `answer_url` | string | URL called when call is answered |
| `answer_method` | string | HTTP verb for answer_url (GET/POST) |
| `hangup_url` | string | URL triggered at call termination |
| `hangup_method` | string | HTTP method for hangup_url |
| `fallback_answer_url` | string | Backup URL if answer_url fails |
| `fallback_method` | string | HTTP verb for fallback endpoint |
| `message_url` | string | SMS callback destination |
| `message_method` | string | HTTP method for message_url |
| `default_number_app` | boolean | Default for new phone numbers |
| `default_endpoint_app` | boolean | Default for new SIP endpoints |
| `sub_account` | string | Parent sub-account auth_id |
| `resource_uri` | string | API endpoint path |
| `application_type` | string | Category (e.g., "voice") |
| `default_app` | boolean | Primary account application flag |
| `enabled` | boolean | Active/inactive status |
| `log_incoming_message` | boolean | Message logging toggle |
| `public_uri` | boolean | Public accessibility flag |
| `sip_transfer_method` | string | HTTP method for SIP transfers |
| `sip_transfer_url` | string | SIP transfer callback URL |
| `sip_uri` | string | Associated SIP URI |
| `created_at` | string | ISO 8601 creation timestamp |
| `updated_at` | string | ISO 8601 modification timestamp |

### Application Webhook Callbacks

**Answer URL Callback (POST):**

| Parameter | Description |
|-----------|-------------|
| `CallUUID` | Unique call identifier |
| `From` | Caller number |
| `To` | Destination number |
| `Direction` | Call direction |
| `CallStatus` | Current call status |

Must respond within 10 seconds with valid XML.

**Hangup URL Callback (POST):**

| Parameter | Description |
|-----------|-------------|
| `CallUUID` | Unique call identifier |
| `CallStatus` | Final call status |
| `Duration` | Call duration |
| `HangupCause` | Reason for termination |

### Create Application

**POST** `https://api.vobiz.ai/api/v1/Account/{authID}/Application/`

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `app_name` | string | Yes | Application name (alphanumeric, hyphens, underscores) |
| `answer_url` | string | Yes | URL fetched when a call executes this application |
| `answer_method` | string | No | HTTP method for answer_url (default: POST) |
| `hangup_url` | string | No | URL notified at call termination |
| `hangup_method` | string | No | HTTP method for hangup_url |
| `fallback_answer_url` | string | No | Invoked if answer_url is unavailable |
| `fallback_method` | string | No | HTTP method for fallback (default: POST) |
| `message_url` | string | No | URL for inbound messages |
| `message_method` | string | No | HTTP method for messages |
| `default_number_app` | boolean | No | Set as default for new numbers |
| `default_endpoint_app` | boolean | No | Set as default for new endpoints |
| `subaccount` | string | No | Associated subaccount ID |
| `application_type` | string | No | Application type (e.g., "voice") |
| `log_incoming_messages` | boolean | No | Enable message logging (default: true) |
| `sip_transfer_url` | string | No | URL for SIP transfer callbacks |
| `sip_transfer_method` | string | No | HTTP method for SIP transfers |

**Response (201 Created):**

```json
{
  "api_id": "{api_id}",
  "message": "created",
  "app_id": "12345678",
  "application_type": "voice",
  "enabled": true,
  "default_app": false,
  "resource_uri": "/v1/Account/{auth_id}/Application/12345678/"
}
```

### Retrieve Application

**GET** `https://api.vobiz.ai/api/v1/Account/{authID}/Application/{appID}/`

No request parameters. Returns the full Application object.

```bash
curl -X GET https://api.vobiz.ai/api/v1/Account/{Auth_ID}/Application/12345678/ \
  -H "X-Auth-ID: YOUR_AUTH_ID" \
  -H "X-Auth-Token: YOUR_AUTH_TOKEN"
```

### Update Application

**POST** `https://api.vobiz.ai/api/v1/Account/{authID}/Application/{appID}/`

All parameters are optional (same as Create, minus `app_name`). Fields omitted remain unchanged.
The `sub_account` field cannot be modified post-creation.

**Response (200 OK):**

```json
{
  "api_id": "{api_id}",
  "message": "changed",
  "app_id": "12345678",
  "application_type": "voice",
  "enabled": true,
  "resource_uri": "/v1/Account/{auth_id}/Application/12345678/"
}
```

### Delete Application

**DELETE** `https://api.vobiz.ai/api/v1/Account/{authID}/Application/{appID}/`

No request parameters. Permanent and irreversible. Fails with 409 if application is linked to phone numbers.

**Response (204 No Content):** Empty body.

**Error (409 Conflict):**

```json
{
  "error": "Cannot delete application",
  "message": "Application is currently in use by 5 phone numbers"
}
```

```bash
curl -X DELETE https://api.vobiz.ai/api/v1/Account/{Auth_ID}/Application/12345678/ \
  -H "X-Auth-ID: YOUR_AUTH_ID" \
  -H "X-Auth-Token: YOUR_AUTH_TOKEN"
```

---

## Phone Numbers

### PhoneNumber Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | UUID identifier |
| `auth_id` | string | Auth ID owning the number; null if unassigned |
| `e164` | string | Phone number in E164 format (e.g., "+14155551234") |
| `country` | string | Country code (e.g., "US", "IN") |
| `region` | string | State/region code (e.g., "CA", "MH") |
| `capabilities` | object | Features supported |
| `capabilities.voice` | boolean | Voice calling support |
| `capabilities.sms` | boolean | SMS messaging support |
| `capabilities.mms` | boolean | MMS messaging support |
| `capabilities.fax` | boolean | Fax support |
| `status` | string | `active`, `pending_purchase`, `pending_release`, `released`, `blocked` |
| `setup_fee` | number | One-time purchase fee |
| `monthly_fee` | number | Recurring monthly charge |
| `currency` | string | Fee currency code (USD, INR, etc.) |
| `trunk_group_id` | string | Assigned trunk group UUID; null if unassigned |
| `purchased_at` | string | ISO 8601 purchase timestamp |
| `released_at` | string | ISO 8601 release timestamp |
| `created_at` | string | ISO 8601 record creation timestamp |
| `updated_at` | string | ISO 8601 modification timestamp |

### List Account Phone Numbers

**GET** `https://api.vobiz.ai/api/v1/account/{auth_id}/numbers`

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Pagination page number |
| `per_page` | integer | 25 | Items per page (max: 100) |
| `include_subaccounts` | boolean | true (master only) | Include sub-account numbers |

**Response (200 OK):**

```json
{
  "items": [
    {
      "id": "uuid",
      "auth_id": "string",
      "e164": "+14155551234",
      "country": "US",
      "region": "CA",
      "capabilities": { "voice": true, "sms": true, "mms": false, "fax": false },
      "status": "active",
      "trunk_group_id": "string",
      "setup_fee": 0.0,
      "monthly_fee": 500.0,
      "currency": "INR",
      "purchased_at": "ISO 8601",
      "created_at": "ISO 8601",
      "updated_at": "ISO 8601"
    }
  ],
  "page": 1,
  "per_page": 25,
  "total": 10
}
```

```bash
curl -X GET "https://api.vobiz.ai/api/v1/account/{AUTH_ID}/numbers" \
  -H "X-Auth-ID: {AUTH_ID}" \
  -H "X-Auth-Token: {AUTH_TOKEN}"
```

### List Inventory Numbers

**GET** `https://api.vobiz.ai/api/v1/account/{auth_id}/inventory/numbers`

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `country` | string | - | Country code filter (e.g., "US", "IN") |
| `page` | integer | 1 | Pagination page number |
| `per_page` | integer | 25 | Items per page (max: 100) |

Returns only numbers with `status='active'` and `auth_id=NULL` (available for purchase).

**Response (200 OK):**

```json
{
  "items": [
    {
      "id": "UUID",
      "e164": "+919876543210",
      "country": "IN",
      "region": "MH",
      "status": "active",
      "setup_fee": 0.0,
      "monthly_fee": 1.0,
      "currency": "INR",
      "created_at": "ISO 8601",
      "updated_at": "ISO 8601"
    }
  ],
  "page": 1,
  "per_page": 25,
  "total": 500
}
```

```bash
curl -X GET "https://api.vobiz.ai/api/v1/account/{AUTH_ID}/inventory/numbers?country=IN&page=1&per_page=25" \
  -H "X-Auth-ID: {AUTH_ID}" \
  -H "X-Auth-Token: {AUTH_TOKEN}"
```

### Purchase from Inventory

**POST** `https://api.vobiz.ai/api/v1/account/{auth_id}/numbers/purchase-from-inventory`

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `e164` | string | Yes | Phone number in E164 format (e.g., "+919876543210") |
| `currency` | string | No | Transaction currency; defaults to number's currency or "USD" |

**Response (200 OK):**

```json
{
  "message": "purchased from inventory",
  "number": {
    "id": "UUID",
    "auth_id": "string",
    "e164": "+919876543210",
    "country": "IN",
    "region": "MH",
    "status": "active",
    "provider": "string",
    "setup_fee": 0.0,
    "monthly_fee": 500.0,
    "currency": "INR",
    "purchased_at": "ISO 8601",
    "created_at": "ISO 8601",
    "updated_at": "ISO 8601"
  }
}
```

For sub-accounts, the parent account absorbs charges.

```bash
curl -X POST https://api.vobiz.ai/api/v1/account/{AUTH_ID}/numbers/purchase-from-inventory \
  -H "X-Auth-ID: {AUTH_ID}" \
  -H "X-Auth-Token: {AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"e164": "+919876543210", "currency": "USD"}'
```

### Release (Unrent) a Number

**DELETE** `https://api.vobiz.ai/api/v1/account/{auth_id}/numbers/{e164_number}`

Path parameter `e164_number` is the phone number in E.164 format.

Releasing a number is permanent and irreversible. The number returns to inventory.

**Response (200 OK):**

```json
{
  "message": "number returned to inventory"
}
```

**Error (403 Forbidden):**

```json
{
  "error": "forbidden",
  "message": "account does not own this number"
}
```

```bash
curl -X DELETE "https://api.vobiz.ai/api/v1/account/{AUTH_ID}/numbers/{PHONE_NUMBER}" \
  -H "X-Auth-ID: {AUTH_ID}" \
  -H "X-Auth-Token: {AUTH_TOKEN}"
```

---

## SIP Trunks

### Trunk Object

| Field | Type | Description |
|-------|------|-------------|
| `trunk_id` | string (UUID) | Unique identifier, auto-generated |
| `auth_id` | string | Account identifier owning the trunk |
| `name` | string | Descriptive name (required, max 255 chars) |
| `description` | string | Optional context |
| `trunk_domain` | string | SIP domain (auto-generated: `trunk_id.sip.vobiz.ai`) |
| `trunk_status` | string | Status: `enabled`, `disabled`, `active` |
| `secure` | boolean | TLS/SRTP encryption enabled |
| `trunk_direction` | string | Call direction: `outbound`, `both`, `inbound` |
| `concurrent_calls_limit` | integer | Max simultaneous calls (default: 10) |
| `cps_limit` | integer | Calls per second rate limit (default: 5) |
| `transport` | string | Protocol: `udp`, `tcp` |
| `ipacl_uuid` | string | IP Access Control List UUID |
| `credential_uuid` | string | Credential UUID for authentication |
| `primary_uri_uuid` | string | Primary Origination URI UUID |
| `fallback_uri_uuid` | string | Fallback Origination URI UUID |
| `inbound_destination` | string | SIP URI for inbound call forwarding |
| `enabled` | boolean | Active status (default: true) |
| `created_at` | string (ISO 8601) | Creation timestamp (UTC) |
| `updated_at` | string (ISO 8601) | Modification timestamp (UTC) |

### SIP Authentication Methods

1. **Username/Password**: SIP digest authentication via Kamailio
2. **IP Whitelisting**: Static IP-based access without passwords

### SIP Configuration

| Setting | Value |
|---------|-------|
| SIP Server | `sip.vobiz.ai` |
| Ports | 5060 (UDP/TCP), 5061 (TLS) |
| Transport | UDP/TCP/TLS |
| WebRTC | JWT auth via `wss://sip.vobiz.ai:7443` |

### SIP Call Error Statuses

`NORMAL_CLEARING`, `USER_BUSY`, `NO_ANSWER`, `SERVICE_UNAVAILABLE`, `ORIGINATOR_CANCEL`, `CALL_REJECTED`, `MEDIA_TIMEOUT`, `NETWORK_OUT_OF_ORDER`, and 10+ others.

### Create Trunk

**POST** `https://api.vobiz.ai/api/v1/account/{auth_id}/trunks`

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Descriptive trunk name (max 255 chars) |
| `trunk_status` | string | No | `enabled` or `disabled` |
| `secure` | boolean | No | Enable TLS/SRTP encryption |
| `trunk_direction` | string | No | `outbound` or `both` |
| `concurrent_calls_limit` | integer | No | Maximum concurrent calls |
| `cps_limit` | integer | No | Calls per second limit |
| `transport` | string | No | `udp` or `tcp` |
| `ipacl_uuid` | string | No | IP Access Control List UUID |
| `credential_uuid` | string | No | Credential UUID |
| `primary_uri_uuid` | string | No | Primary Origination URI UUID |
| `fallback_uri_uuid` | string | No | Fallback Origination URI UUID |
| `inbound_destination` | string | No | SIP URI for inbound call forwarding |
| `trunk_domain` | string | No | Custom SIP domain |

**Response (201 Created):** Returns trunk object with auto-generated `trunk_id`.

```bash
curl -X POST https://api.vobiz.ai/api/v1/account/AUTH_ID/trunks \
  -H "X-Auth-ID: AUTH_ID" \
  -H "X-Auth-Token: AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My SIP Trunk",
    "trunk_status": "enabled",
    "trunk_direction": "outbound",
    "concurrent_calls_limit": 10,
    "cps_limit": 5,
    "transport": "udp"
  }'
```

### Retrieve Trunk

**GET** `https://api.vobiz.ai/api/v1/account/{auth_id}/trunks/{trunk_id}`

Returns the complete Trunk object. 404 if trunk doesn't exist or doesn't belong to your account.

```bash
curl -X GET https://api.vobiz.ai/api/v1/account/{Auth_ID}/trunks/{trunk_id} \
  -H "X-Auth-ID: YOUR_AUTH_ID" \
  -H "X-Auth-Token: YOUR_AUTH_TOKEN"
```

### Update Trunk

**PUT** `https://api.vobiz.ai/api/v1/account/{auth_id}/trunks/{trunk_id}`

**Request Parameters (all optional):**

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Trunk name (max 255 chars) |
| `description` | string | Trunk description |
| `enabled` | boolean | Enable/disable trunk |

`trunk_id` and `auth_id` cannot be modified post-creation.

**Response (200 OK):** Returns the complete updated trunk object.

```bash
curl -X PUT https://api.vobiz.ai/api/v1/account/{Auth_ID}/trunks/{trunk_id} \
  -H "X-Auth-ID: YOUR_AUTH_ID" \
  -H "X-Auth-Token: YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Production Trunk"}'
```

### Delete Trunk

**DELETE** `https://api.vobiz.ai/api/v1/account/{auth_id}/trunks/{trunk_id}`

Permanently removes the trunk, all associated credentials, IP ACL entries, origination URIs. Terminates active calls.

**Response (204 No Content):** Empty body.

**Error (409 Conflict):** Trunk has ongoing calls preventing deletion.

```bash
curl -X DELETE https://api.vobiz.ai/api/v1/account/{Auth_ID}/trunks/{trunk_id} \
  -H "X-Auth-ID: YOUR_AUTH_ID" \
  -H "X-Auth-Token: YOUR_AUTH_TOKEN"
```

---

## Trunk Credentials

SIP username/password authentication. Multiple credentials per trunk. Passwords are write-only (never returned in API responses).

### Credential Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Unique auto-generated identifier |
| `trunk_id` | string (UUID) | Associated trunk ID |
| `username` | string | SIP username (required, unique per trunk, immutable after creation) |
| `password` | string | SIP password (required, min 8 chars, write-only) |
| `enabled` | boolean | Active status (default: true) |
| `description` | string | Context/purpose description |
| `created_at` | string (ISO 8601) | Creation timestamp (UTC) |
| `updated_at` | string (ISO 8601) | Modification timestamp (UTC) |

### Create Credential

**POST** `https://api.vobiz.ai/api/v1/account/{auth_id}/credentials`

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `username` | string | Yes | SIP username (unique within account, immutable) |
| `password` | string | Yes | Min 8 chars, 12+ recommended |
| `enabled` | boolean | No | Active status (default: true) |
| `description` | string | No | Context about use |

**Response (201 Created):**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "username": "trunk_user_002",
  "enabled": true,
  "description": "Backup credential",
  "created_at": "2025-01-22T10:30:00Z",
  "updated_at": "2025-01-22T10:30:00Z"
}
```

Password is NOT included in the response. Duplicate usernames return 409 Conflict.

### Retrieve All Credentials

**GET** `https://api.vobiz.ai/api/v1/account/{auth_id}/trunks/credentials`

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 20 | Max credentials per page |
| `offset` | integer | 0 | Number to skip |

**Response (200 OK):**

```json
{
  "meta": {
    "limit": 20,
    "offset": 0,
    "total_count": 3
  },
  "objects": [
    {
      "id": "UUID",
      "username": "string",
      "enabled": true,
      "description": "string",
      "created_at": "ISO 8601",
      "updated_at": "ISO 8601"
    }
  ]
}
```

```bash
curl -X GET "https://api.vobiz.ai/api/v1/account/{Auth_ID}/trunks/credentials?limit=10&offset=0" \
  -H "X-Auth-ID: YOUR_AUTH_ID" \
  -H "X-Auth-Token: YOUR_AUTH_TOKEN"
```

### Update Credential

**PUT** `https://api.vobiz.ai/api/v1/account/{auth_id}/credentials/{credential_id}`

**Request Parameters (all optional):**

| Parameter | Type | Description |
|-----------|------|-------------|
| `password` | string | New SIP password (min 8 chars) |
| `enabled` | boolean | Activation status |
| `description` | string | Updated description |

Username cannot be changed.

**Response (200 OK):** Returns the updated credential object (without password).

### Delete Credential

**DELETE** `https://api.vobiz.ai/api/v1/account/{auth_id}/credentials/{credential_id}`

Permanently removes the credential. Immediately prevents authentication. Disconnects active calls using this credential.

**Response (204 No Content):** Empty body.

**Error (409 Conflict):** Credential in use by active calls.

```bash
curl -X DELETE https://api.vobiz.ai/api/v1/account/{Auth_ID}/credentials/{credential_id} \
  -H "X-Auth-ID: YOUR_AUTH_ID" \
  -H "X-Auth-Token: YOUR_AUTH_TOKEN"
```

---

## Origination URIs

Origination URIs define SIP endpoints where outbound calls from your trunk will be routed. Multiple URIs per trunk with priority/weight-based traffic distribution.

### Origination URI Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Unique identifier, auto-generated |
| `trunk_id` | string (UUID) | Parent trunk identifier |
| `uri` | string | SIP destination (e.g., `sip:user@host:port` or `sip:host:port`) |
| `priority` | integer | Routing priority; lower = higher priority (default: 1) |
| `weight` | integer | Load balancing weight; higher = more traffic (default: 10) |
| `enabled` | boolean | Active status (default: true) |
| `created_at` | string (ISO 8601) | Creation timestamp (UTC) |
| `updated_at` | string (ISO 8601) | Modification timestamp (UTC) |

**Routing behavior:** System attempts URIs sequentially by priority. Among equal-priority URIs, traffic is distributed proportionally to weight values (weight 20 = double traffic of weight 10).

### Create Origination URI

**POST** `https://api.vobiz.ai/api/v1/account/{auth_id}/origination-uris`

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uri` | string | Yes | SIP destination (format: `sip:user@host:port` or `sip:host:port`) |
| `priority` | integer | No | Routing priority (default: 1) |
| `weight` | integer | No | Load balancing weight (default: 10) |
| `enabled` | boolean | No | Active status (default: true) |

**Response (201 Created):**

```json
{
  "id": "e1f2a3b4-c5d6-7890-efab-567890123456",
  "uri": "sip:provider@sip.example.com:5060",
  "priority": 1,
  "weight": 10,
  "enabled": true,
  "created_at": "2025-01-22T12:00:15Z",
  "updated_at": "2025-01-22T12:00:15Z"
}
```

**Error (400):** Invalid SIP URI format.

### Retrieve All Origination URIs

**GET** `https://api.vobiz.ai/api/v1/account/{auth_id}/trunks/origination-uris`

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 20 | Results per page (1-100) |
| `offset` | integer | 0 | Number to skip |

**Response (200 OK):**

```json
{
  "meta": {
    "limit": 20,
    "offset": 0,
    "total_count": 3
  },
  "objects": [
    {
      "id": "UUID",
      "uri": "sip:provider@sip.example.com:5060",
      "priority": 1,
      "weight": 10,
      "enabled": true,
      "created_at": "ISO 8601",
      "updated_at": "ISO 8601"
    }
  ]
}
```

### Update Origination URI

**PUT** `https://api.vobiz.ai/api/v1/account/{auth_id}/origination-uris/{uri_id}`

**Request Parameters (all optional):**

| Parameter | Type | Description |
|-----------|------|-------------|
| `uri` | string | SIP destination |
| `priority` | integer | Routing priority |
| `weight` | integer | Load balancing weight |
| `enabled` | boolean | Active status |

**Response (200 OK):** Returns the updated origination URI object.

### Delete Origination URI

**DELETE** `https://api.vobiz.ai/api/v1/account/{auth_id}/origination-uris/{uri_id}`

Irreversible. Docs recommend disabling (`enabled: false`) instead of deleting. Maintain minimum two URIs for redundancy.

**Response (204 No Content):** Empty body.

```bash
curl -X DELETE https://api.vobiz.ai/api/v1/account/{Auth_ID}/origination-uris/{uri_id} \
  -H "X-Auth-ID: YOUR_AUTH_ID" \
  -H "X-Auth-Token: YOUR_AUTH_TOKEN"
```

---

## Endpoints (SIP)

### Endpoint Object

| Field | Type | Description |
|-------|------|-------------|
| `endpoint_id` | string | Unique identifier |
| `username` | string | SIP username (alphanumeric, account-unique) |
| `alias` | string | Friendly name |
| `sip_uri` | string | Full SIP URI (`sip:username@sip.vobiz.ai`) |
| `sip_registered` | string | Registration status ("true" or "false") |
| `sip_contact` | string | Client contact address (when registered) |
| `sip_expires` | string (ISO 8601) | Registration expiration (when registered) |
| `sip_user_agent` | string | SIP client identifier (when registered) |
| `sip_registration` | object | Detailed registration metadata (when registered) |
| `application` | object | Call routing app details (null if unattached) |
| `resource_uri` | string | API resource endpoint path |
| `sub_account` | string | Parent sub-account auth_id (null for main) |
| `allow_voice` | boolean | Voice calls (default: true) |
| `allow_message` | boolean | Messaging (default: true) |
| `allow_video` | boolean | Video (default: false) |
| `allow_same_domain` | boolean | Same-domain calls (default: true) |
| `allow_other_domains` | boolean | Other domains (default: false) |
| `allow_phones` | boolean | Phone number calls (default: true) |
| `allow_apps` | boolean | App calls (default: true) |
| `created_at` | string (ISO 8601) | Creation timestamp |
| `updated_at` | string (ISO 8601) | Modification timestamp |

Password is write-only and never returned.

### Create Endpoint

**POST** `https://api.vobiz.ai/api/v1/Account/{authID}/Endpoint/`

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `username` | string | Yes | Unique alphanumeric SIP username |
| `password` | string | Yes | Min 8 chars recommended |
| `alias` | string | No | Friendly name |
| `application` | integer | No | Application ID for call routing |
| `allow_voice` | boolean | No | Default: true |
| `allow_message` | boolean | No | Default: true |
| `allow_video` | boolean | No | Default: false |
| `allow_same_domain` | boolean | No | Default: true |
| `allow_other_domains` | boolean | No | Default: false |
| `allow_phones` | boolean | No | Default: true |
| `allow_apps` | boolean | No | Default: true |
| `sub_account` | string | No | Sub-account auth_id |

**Response (201 Created):**

```json
{
  "api_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "created",
  "endpoint_id": "87654321",
  "sip_uri": "sip:john_doe@sip.vobiz.ai",
  "resource_uri": "/v1/Account/{Auth_ID}/Endpoint/87654321/"
}
```

### Retrieve Endpoint

**GET** `https://api.vobiz.ai/api/v1/Account/{authID}/Endpoint/{endpointID}/`

Returns the full Endpoint object.

```bash
curl -X GET https://api.vobiz.ai/api/v1/Account/{Auth_ID}/Endpoint/87654321/ \
  -H "X-Auth-ID: YOUR_AUTH_ID" \
  -H "X-Auth-Token: YOUR_AUTH_TOKEN"
```

### Update Endpoint

**POST** `https://api.vobiz.ai/api/v1/Account/{authID}/Endpoint/{endpointID}/`

**Request Parameters (all optional):**

| Parameter | Type | Description |
|-----------|------|-------------|
| `password` | string | New password (min 8 chars) |
| `alias` | string | Friendly name |
| `application` | integer | Application ID |
| `allow_voice` | boolean | Default: true |
| `allow_message` | boolean | Default: true |
| `allow_video` | boolean | Default: false |

**Locked fields (cannot be updated):** `username`, `endpoint_id`, `domain`, `allow_same_domain`, `allow_other_domains`, `allow_phones`, `allow_apps`.

**Response (202 Accepted):** Empty body.

```bash
curl -X POST https://api.vobiz.ai/api/v1/Account/{Auth_ID}/Endpoint/87654321/ \
  -H "X-Auth-ID: YOUR_AUTH_ID" \
  -H "X-Auth-Token: YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"alias": "Updated Name", "password": "NewSecurePassword456!"}'
```

### Delete Endpoint

**DELETE** `https://api.vobiz.ai/api/v1/Account/{authID}/Endpoint/{endpointID}/`

Permanent and irreversible. All registered devices disconnect immediately.

**Response (204 No Content):** Empty body.

```bash
curl -X DELETE https://api.vobiz.ai/api/v1/Account/{Auth_ID}/Endpoint/87654321/ \
  -H "X-Auth-ID: YOUR_AUTH_ID" \
  -H "X-Auth-Token: YOUR_AUTH_TOKEN"
```

### List All Endpoints

**GET** `https://api.vobiz.ai/api/v1/Account/{authID}/Endpoint/`

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | integer | Results per page (max 100, default 20) |
| `offset` | integer | Results to skip (default 0) |
| `username__contains` | string | Partial username match |
| `username__exact` | string | Exact username match |
| `username__startswith` | string | Username prefix filter |
| `alias__contains` | string | Partial alias match |
| `alias__exact` | string | Exact alias match |
| `application_id__exact` | integer | Filter by application ID |
| `application_id__isnull` | boolean | Endpoints without application |
| `sub_account` | string | Filter by sub-account auth_id |

**Response (200 OK):**

```json
{
  "api_id": "string",
  "meta": {
    "limit": 20,
    "offset": 0,
    "total_count": 5
  },
  "objects": [
    { /* Endpoint objects */ }
  ]
}
```

```javascript
const response = await fetch(
  'https://api.vobiz.ai/api/v1/Account/{Auth_ID}/Endpoint/',
  {
    headers: {
      'X-Auth-ID': '{Auth_ID}',
      'X-Auth-Token': '{access_token}'
    }
  }
);
const data = await response.json();
```

---

## Calls

### Make a Call

**POST** `https://api.vobiz.ai/api/v1/Account/{auth_id}/Call/`

**Required Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `from` | string | Caller ID in E.164 format (e.g., 14157654321) |
| `to` | string | Destination number(s) or SIP URI(s); use `<` separator for multiple (max 1000) |
| `answer_url` | string | URL invoked when call answers; must return valid XML |

**Optional Parameters - Callbacks:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `answer_method` | string | HTTP method for answer_url |
| `ring_url` | string | URL called on ring |
| `ring_method` | string | HTTP method for ring_url |
| `hangup_url` | string | URL called on hangup |
| `hangup_method` | string | HTTP method for hangup_url |
| `fallback_url` | string | Backup URL if answer_url fails |
| `fallback_method` | string | HTTP method for fallback_url |

**Optional Parameters - Machine Detection:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `machine_detection` | string | `true` (continue) or `hangup` (disconnect) |
| `machine_detection_time` | integer | Audio analysis duration: 2000-10000ms (default: 5000) |
| `machine_detection_url` | string | Callback URL for async detection results |
| `machine_detection_method` | string | HTTP method (default: POST) |
| `machine_detection_maximum_speech_length` | integer | Max speech: 1000-6000ms (default: 5000) |
| `machine_detection_initial_silence` | integer | Max post-answer silence: 2000-10000ms (default: 4500) |
| `machine_detection_maximum_words` | integer | Max sentences: 2-10 (default: 3) |
| `machine_detection_initial_greeting` | integer | Max greeting: 1000-5000ms (default: 1500) |

**Optional Parameters - Advanced:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `caller_name` | string | Caller ID name |
| `send_digits` | string | DTMF digits to send on answer |
| `send_on_preanswer` | boolean | Send digits during early media |
| `time_limit` | integer | Max call duration in seconds |
| `hangup_on_ring` | integer | Hang up after N rings |

**Machine Detection Callback Fields (async):**

| Field | Description |
|-------|-------------|
| `From`, `To`, `CallUUID`, `RequestUUID` | Call identifiers |
| `Machine` | boolean - true if machine detected |
| `IfMachine` | "continue" or "hangup" |
| `Direction` | "outbound" |
| `Event` | "MachineDetection" |
| `CallStatus` | "in-progress" |

**Response (201 Created):**

```json
{
  "api_id": "string",
  "message": "call fired",
  "request_uuid": "string"
}
```

### Transfer a Call

**POST** `https://api.vobiz.ai/api/v1/Account/{auth_id}/Call/{call_uuid}/`

Redirects active calls to new XML instruction URLs.

**Request Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `legs` | string | No | "aleg" | Transfer target: `aleg`, `bleg`, `both` |
| `aleg_url` | string | No | - | Destination URL for A leg; must return valid XML |
| `aleg_method` | string | No | POST | HTTP method for aleg_url |
| `bleg_url` | string | No | - | Destination URL for B leg; must return valid XML |
| `bleg_method` | string | No | POST | HTTP method for bleg_url |

Call must be actively in-progress. Transfer immediately executes XML from the new URL.

**Response (202 Accepted):**

```json
{
  "api_id": "uuid-here",
  "message": "call transferred",
  "call_uuid": "call-uuid-here"
}
```

### Hang Up a Call

**DELETE** `https://api.vobiz.ai/api/v1/Account/{auth_id}/Call/{call_uuid}/`

Terminates active call immediately. Triggers `hangup_url` callback. CDR shows `hangup_source` as "API" with `hangup_cause_code` 16 (`NORMAL_CLEARING`).

**Response (204 No Content):** Empty body.

```bash
curl -X DELETE https://api.vobiz.ai/api/v1/Account/{auth_id}/Call/{call_uuid}/ \
  -H "X-Auth-ID: YOUR_AUTH_ID" \
  -H "X-Auth-Token: YOUR_AUTH_TOKEN"
```

### Retrieve Live Call

**GET** `https://api.vobiz.ai/api/v1/account/{auth_id}/call/{callUuid}/?status=live`

Query parameter `status=live` is required.

**Response (200 OK):**

```json
{
  "api_id": "string",
  "calls": [
    {
      "answer_time": "datetime",
      "call_state": "string",
      "call_duration": 120,
      "call_uuid": "string",
      "call_direction": "string",
      "from_number": "string",
      "to_number": "string",
      "initiation_time": "datetime",
      "end_time": null,
      "billed_duration": null,
      "total_amount": null,
      "stir_verification": "string",
      "stir_attestation": "string",
      "source_ip": "string"
    }
  ]
}
```

**Call State Values:** `RINGING`, `EARLY`, `ACTIVE`, `HELD`

Billing fields remain `null` until call completion. Returns 404 if call isn't active.

### Retrieve All Live Calls

**GET** `https://api.vobiz.ai/api/v1/account/{auth_id}/call/?status=live`

**Response (200 OK):**

```json
{
  "api_id": "string",
  "calls": ["call_uuid_1", "call_uuid_2"]
}
```

Returns array of active call UUIDs.

### Retrieve Queued Call

**GET** `https://api.vobiz.ai/api/v1/account/{auth_id}/call/{callUuid}/?status=queued`

**Response (200 OK):**

```json
{
  "direction": "outbound",
  "from": "15856338537",
  "call_status": "queued",
  "api_id": "uuid",
  "to": "14154290945",
  "caller_name": "+15856338537",
  "call_uuid": "uuid",
  "request_uuid": "uuid"
}
```

### Retrieve All Queued Calls

**GET** `https://api.vobiz.ai/api/v1/account/{auth_id}/call/?status=queued`

Returns max 20 call UUIDs per request.

**Response (200 OK):**

```json
{
  "api_id": "uuid",
  "calls": ["uuid1", "uuid2"]
}
```

---

## Call Play Audio

### Play Audio

**POST** `https://api.vobiz.ai/api/v1/Account/{auth_id}/Call/{call_uuid}/Play/`

**Request Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `urls` | array | Yes | - | Audio file URLs (MP3, WAV) |
| `length` | integer | No | - | Max playback duration (seconds) |
| `legs` | string | No | "aleg" | `aleg`, `bleg`, `both` |
| `loop` | boolean | No | false | Loop audio |
| `mix` | boolean | No | true | Mix with call audio |

Multiple files play sequentially. Files must be accessible via HTTP/HTTPS.

**Response (202 Accepted):**

```json
{
  "api_id": "uuid-here",
  "message": "play started"
}
```

### Stop Audio

**DELETE** `https://api.vobiz.ai/api/v1/Account/{auth_id}/Call/{call_uuid}/Play/`

No request body required.

**Response (204 No Content):** Empty body.

```bash
curl -X DELETE https://api.vobiz.ai/api/v1/Account/{auth_id}/Call/{call_uuid}/Play/ \
  -H "X-Auth-ID: YOUR_AUTH_ID" \
  -H "X-Auth-Token: YOUR_AUTH_TOKEN"
```

---

## Call Speak Text (TTS)

### Speak Text

**POST** `https://api.vobiz.ai/api/v1/Account/{auth_id}/Call/{call_uuid}/Speak/`

**Request Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `text` | string | Yes | - | Text to convert (max 500 chars recommended) |
| `voice` | string | No | WOMAN | `WOMAN`, `MAN`, `Polly` |
| `language` | string | No | en-US | Language code |
| `legs` | string | No | aleg | `aleg`, `bleg`, `both` |
| `loop` | boolean | No | false | Repeat speech |
| `mix` | boolean | No | true | Blend with call audio |

29 languages supported: en-US, en-GB, en-AU, es-ES, es-US, fr-FR, fr-CA, de-DE, it-IT, pt-PT, pt-BR, da-DK, nl-NL, pl-PL, ru-RU, sv-SE, zh-CN, ja-JP, ar-SA, and more.

**Response (202 Accepted):**

```json
{
  "api_id": "uuid-here",
  "message": "speak started"
}
```

```bash
curl -X POST https://api.vobiz.ai/api/v1/Account/{auth_id}/Call/{call_uuid}/Speak/ \
  -H "X-Auth-ID: YOUR_AUTH_ID" \
  -H "X-Auth-Token: YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello, this is a test message.","voice":"WOMAN","language":"en-US"}'
```

### Stop Speaking

**DELETE** `https://api.vobiz.ai/api/v1/Account/{auth_id}/Call/{call_uuid}/Speak/`

No parameters required. Returns success even if no TTS is currently playing.

**Response (204 No Content):** Empty body.

---

## Call DTMF

### Send DTMF Digits

**POST** `https://api.vobiz.ai/api/v1/Account/{auth_id}/Call/{call_uuid}/DTMF/`

**Request Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `digits` | string | Yes | - | DTMF characters: 0-9, *, # |
| `leg` | string | No | "aleg" | Target: `aleg` or `bleg` |

Call must be active. Add delays between sends for IVR processing.

**Response (202 Accepted):**

```json
{
  "api_id": "uuid-here",
  "message": "digits sent"
}
```

```bash
curl -X POST https://api.vobiz.ai/api/v1/Account/{auth_id}/Call/{call_uuid}/DTMF/ \
  -H "X-Auth-ID: YOUR_AUTH_ID" \
  -H "X-Auth-Token: YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"digits": "1234#", "leg": "aleg"}'
```

---

## Audio Streams (WebSocket)

Real-time audio forking from active calls via WebSocket.

### Audio Stream Object

| Field | Type | Description |
|-------|------|-------------|
| `stream_id` | string (UUID) | Unique stream identifier |
| `call_uuid` | string (UUID) | Associated call UUID |
| `service_url` | string | WebSocket URL |
| `status_callback_url` | string | Webhook URL for status changes |
| `bidirectional` | boolean | Read/write audio enabled |
| `audio_track` | string | `inbound`, `outbound`, or `both` |
| `content_type` | string | Audio codec/format |
| `status` | string | Stream status |
| `start_time` | string (ISO 8601) | Stream start time |
| `end_time` | string/null | Stream end time |

### Start Audio Stream

**POST** `https://api.vobiz.ai/api/v1/Account/{auth_id}/Call/{call_uuid}/Stream/`

**Request Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `service_url` | string | Yes | - | WebSocket URL (wss:// or ws://) |
| `audio_track` | string | No | "inbound" | `inbound`, `outbound`, or `both` |
| `bidirectional` | boolean | No | false | Enable sending audio back to call |
| `content_type` | string | No | - | Codec: `audio/x-l16;rate=8000/16000/24000` or `audio/x-mulaw;rate=8000` |
| `stream_timeout` | integer | No | 86400 | Max duration in seconds |
| `status_callback_url` | string | No | - | Webhook URL for stream status |
| `status_callback_method` | string | No | "POST" | HTTP method for callbacks |
| `extra_headers` | string | No | - | Comma-separated custom headers for WebSocket |

**Bidirectional Audio Format (send to WebSocket):**

```json
{
  "event": "playAudio",
  "media": {
    "contentType": "audio/x-l16|audio/x-mulaw",
    "sampleRate": "8000|16000",
    "payload": "<base64-encoded-audio>"
  }
}
```

**Status Callback Events:** Stream connected, Stream stopped, Stream timeout, Stream failed.

**Response (202 Accepted):**

```json
{
  "message": "audio streaming started",
  "stream_id": "728e273b-9c2c-4902-8509-2f88224cd3d5"
}
```

Billed per minute of audio forked.

### Retrieve Audio Stream

**GET** `https://api.vobiz.ai/api/v1/Account/{auth_id}/Call/{call_uuid}/Stream/{stream_id}/`

**Response (200 OK):** Returns the Audio Stream object.

### List Audio Streams

**GET** `https://api.vobiz.ai/api/v1/Account/{auth_id}/Call/{call_uuid}/Stream/`

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 20 | Pagination limit |
| `offset` | integer | 0 | Pagination offset |

**Response (200 OK):**

```json
{
  "page": 1,
  "per_page": 10,
  "total": 1,
  "objects": [
    { /* Audio Stream objects */ }
  ]
}
```

### Stop Audio Stream

**DELETE** `https://api.vobiz.ai/api/v1/Account/{auth_id}/Call/{call_uuid}/Stream/{stream_id}/`

Stops a specific stream without affecting others on the same call.

**Response (204 No Content):** Empty body.

```bash
curl -X DELETE 'https://api.vobiz.ai/api/v1/Account/{auth_id}/Call/{call_uuid}/Stream/{stream_id}/' \
  -H 'X-Auth-ID: {auth_id}' \
  -H 'X-Auth-Token: {auth_token}'
```

### Stop All Audio Streams

**DELETE** `https://api.vobiz.ai/api/v1/Account/{auth_id}/Call/{call_uuid}/Stream/`

Stops all active streams on a call. Idempotent (already-stopped streams unaffected).

**Response (204 No Content):** Empty body.

---

## Recordings

### Recording Object

| Field | Type | Description |
|-------|------|-------------|
| `recording_id` | string | Unique identifier |
| `recording_url` | string | HTTPS download link |
| `recording_format` | string | `mp3` or `wav` |
| `call_uuid` | string | Associated call UUID |
| `conference_name` | string | Conference identifier (null for regular calls) |
| `recording_type` | string | `call` or `conference` |
| `from_number` | string | Caller in E.164 format |
| `to_number` | string | Destination in E.164 format |
| `add_time` | string | ISO 8601 creation timestamp |
| `recording_start_ms` | float | Start time (ms since epoch) |
| `recording_end_ms` | float | End time (ms since epoch) |
| `recording_duration_ms` | float | Actual duration in ms |
| `rounded_recording_duration` | integer | Rounded seconds for billing |
| `recording_storage_duration` | integer | Days since creation |
| `recording_storage_rate` | float | Monthly storage cost (USD) |
| `monthly_recording_storage_amount` | float | Current billing cycle cost |

**Billing:** Recordings under 60 seconds round up to 60 seconds. All durations round to nearest 60-second interval.

### Retrieve Recording

**GET** `https://api.vobiz.ai/api/v1/Account/{auth_id}/Recording/{recording_id}/`

**Response (200 OK):**

```json
{
  "api_id": "UUID",
  "meta": {
    "limit": 20,
    "next": null,
    "offset": 0,
    "previous": null,
    "total_count": 1
  },
  "objects": [{
    "add_time": "ISO timestamp",
    "call_uuid": "UUID",
    "conference_name": "string",
    "from_number": "phone number",
    "recording_duration_ms": "milliseconds",
    "recording_format": "mp3|wav",
    "recording_id": "UUID",
    "recording_url": "URL string",
    "recording_type": "call",
    "to_number": "phone number",
    "rounded_recording_duration": "seconds"
  }]
}
```

```bash
curl -X GET https://api.vobiz.ai/api/v1/Account/{Auth_ID}/Recording/abc123def456/ \
  -H "X-Auth-ID: YOUR_AUTH_ID" \
  -H "X-Auth-Token: YOUR_AUTH_TOKEN"
```

### List All Recordings

**GET** `https://api.vobiz.ai/api/v1/Account/{auth_id}/Recording/`

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 20 | Max recordings per page (max: 100) |
| `offset` | integer | 0 | Starting position |
| `call_uuid` | string | - | Filter by call UUID |
| `recording_type` | string | - | Filter: `trunk` or `extension` |

**Response (200 OK):**

```json
{
  "recordings": [
    {
      "recording_id": "string",
      "call_id": "UUID",
      "recording_type": "string",
      "url": "string",
      "download_path": "string",
      "duration": 120,
      "created_at": "ISO 8601",
      "file_size": 1024,
      "format": "mp3"
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 50,
    "has_more": true
  }
}
```

```bash
curl -X GET "https://api.vobiz.ai/api/v1/Account/MA_XXXXXXXX/Recording/?limit=20&offset=0&recording_type=trunk" \
  -H "X-Auth-ID: MA_XXXXXXXX" \
  -H "X-Auth-Token: your_auth_token" \
  -H "Content-Type: application/json"
```

### Download Recording

**GET** `https://media.vobiz.ai/v1/Account/{Auth_ID}/Recording/{recording_id}.wav`

Note: Different base URL (`media.vobiz.ai`). Use `-L` flag for redirects. Auth headers required.

```bash
curl -L "https://media.vobiz.ai/v1/Account/{Auth_ID}/Recording/{recording_id}.wav" \
  -H "X-Auth-ID: {Auth_ID}" \
  -H "X-Auth-Token: YOUR_AUTH_TOKEN" \
  -o my_recording.wav
```

Standard HTML audio tags cannot transmit custom headers; use server-side proxying.

### Delete Recording

**DELETE** `https://api.vobiz.ai/api/v1/Account/{auth_id}/Recording/{recording_id}/`

Permanent and irreversible. Recording file and URL become inaccessible.

**Response (204 No Content):** Empty body.

```bash
curl -X DELETE https://api.vobiz.ai/api/v1/Account/{Auth_ID}/Recording/abc123def456/ \
  -H "X-Auth-ID: YOUR_AUTH_ID" \
  -H "X-Auth-Token: YOUR_AUTH_TOKEN"
```

---

## CDR (Call Detail Records)

### List CDRs

**GET** `https://api.vobiz.ai/api/v1/account/{account_id}/cdr`

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `from_number` | string | - | Originating phone number |
| `to_number` | string | - | Destination phone number |
| `start_date` | string | - | YYYY-MM-DD format |
| `end_date` | string | - | YYYY-MM-DD format |
| `call_direction` | string | - | `inbound` or `outbound` |
| `min_duration` | integer | - | Minimum call duration in seconds |
| `page` | integer | 1 | Page number |
| `per_page` | integer | 20 | Items per page (max: 100) |

**Response (200 OK):**

```json
{
  "data": [
    {
      "call_id": "string",
      "from_number": "string (E.164)",
      "to_number": "string (E.164)",
      "direction": "string",
      "duration": 120,
      "status": "string",
      "start_time": "ISO 8601",
      "end_time": "ISO 8601",
      "cost": 0.45,
      "currency": "INR",
      "trunk_id": "string",
      "caller_id": "string",
      "hangup_cause": "string"
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 20,
    "total_records": 100,
    "total_pages": 5
  }
}
```

**Status Values:** `completed`, `no-answer`, `busy`, `failed`

**Hangup Causes:** `NORMAL_CLEARING`, `USER_BUSY`, `NO_ANSWER`, `ORIGINATOR_CANCEL`, `CALL_REJECTED`, `SERVICE_UNAVAILABLE`, `MEDIA_TIMEOUT`, `NETWORK_OUT_OF_ORDER`, and 10+ others.

### Get Single CDR

**GET** `https://api.vobiz.ai/api/v1/account/{account_id}/cdr/{call_id}`

Returns CDR for a specific completed call.

### Search CDRs

**GET** `https://api.vobiz.ai/api/v1/account/{account_id}/cdr/search`

Same filters as List CDRs. Response includes a `filter_summary` object.

### Recent CDRs

**GET** `https://api.vobiz.ai/api/v1/account/{account_id}/cdr/recent`

Returns most recent CDRs without requiring date range.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 20 | Number of records |

### Export CDRs as CSV

**GET** `https://api.vobiz.ai/api/v1/account/{account_id}/cdr/export`

Returns CDR data as downloadable CSV. Use same filters as List. Content-Type: `text/csv`. Do not send `Accept: application/json`.

---

## Conferences

### Conference Object

| Field | Type | Description |
|-------|------|-------------|
| `conference_name` | string | Unique conference room identifier |
| `conference_run_time` | string | Duration in seconds since initiation |
| `conference_member_count` | string | Current active participant count |
| `members` | array | Collection of member objects |

**Member Object:**

| Field | Type | Description |
|-------|------|-------------|
| `member_id` | string | Unique identifier within conference |
| `muted` | boolean | Audio transmission status |
| `deaf` | boolean | Audio reception status |
| `from` | string | Call source (PSTN or SIP) |
| `to` | string | Conference destination |
| `caller_name` | string | Participant name (SIP only) |
| `direction` | string | `inbound` or `outbound` |
| `call_uuid` | string | Unique call identifier |
| `join_time` | string | Seconds since participant joined |

### Retrieve Conference

**GET** `https://api.vobiz.ai/api/v1/Account/{auth_id}/Conference/{conference_name}/`

URL-encode conference names with spaces as %20.

**Response (200 OK):**

```json
{
  "conference_name": "My Conf Room",
  "conference_run_time": "600",
  "conference_member_count": "3",
  "members": [
    {
      "muted": false,
      "member_id": "1",
      "deaf": false,
      "from": "+14155551234",
      "to": "+14155559999",
      "caller_name": "",
      "direction": "inbound",
      "call_uuid": "uuid",
      "join_time": "300"
    }
  ],
  "api_id": "uuid"
}
```

```bash
curl -X GET https://api.vobiz.ai/api/v1/Account/{auth_id}/Conference/My%20Conf%20Room/ \
  -H "X-Auth-ID: YOUR_AUTH_ID" \
  -H "X-Auth-Token: YOUR_AUTH_TOKEN"
```

### Hang Up Conference

**DELETE** `https://api.vobiz.ai/api/v1/Account/{auth_id}/Conference/{conference_name}/`

Terminates conference and disconnects all participants. Stops active recordings. Irreversible.

**Response (204 No Content):** Empty body.

```bash
curl -X DELETE https://api.vobiz.ai/api/v1/Account/{auth_id}/Conference/My%20Conf%20Room/ \
  -H "X-Auth-ID: YOUR_AUTH_ID" \
  -H "X-Auth-Token: YOUR_AUTH_TOKEN"
```

### Hang Up All Conferences

**DELETE** `https://api.vobiz.ai/api/v1/Account/{auth_id}/Conference/`

Terminates ALL active conferences simultaneously. Irreversible.

**Response (204 No Content):** Empty body.

```bash
curl -X DELETE https://api.vobiz.ai/api/v1/Account/{auth_id}/Conference/ \
  -H "X-Auth-ID: YOUR_AUTH_ID" \
  -H "X-Auth-Token: YOUR_AUTH_TOKEN"
```

---

## Voice XML Reference

Voice XML controls call flow via webhook-driven XML responses. When a call event occurs, Vobiz sends an HTTP request to your configured URL; your server responds with XML instructions.

### How It Works

1. Call event triggers webhook to your configured URL
2. Vobiz POSTs with call details (CallUUID, From, To, Direction, CallStatus)
3. Your server returns XML instructions within 1-2 seconds
4. Vobiz parses and executes elements sequentially
5. If XML contains action URLs, new webhooks fire (cycle repeats)

**XML is stateless** -- each webhook operates independently. Track conversations via CallUUID.

### Root Element

All XML must be wrapped in `<Response>`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <!-- Elements go here -->
</Response>
```

### Speak

Text-to-speech output.

**Attributes:**

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `voice` | string | WOMAN | `WOMAN` or `MAN` |
| `language` | string | en-US | Language code |
| `loop` | integer | 1 | Repeat count (0 = infinite) |

**Supported Languages:** en-US, en-GB, en-AU, es-ES, es-US, fr-FR, fr-CA, pt-PT, pt-BR, da-DK, nl-NL, de-DE, it-IT, pl-PL, ru-RU, sv-SE (14 languages with regional variants).

```xml
<Response>
    <Speak voice="WOMAN" language="en-US" loop="2">
        Hello, welcome to our service.
    </Speak>
</Response>
```

### Play

Audio file playback (MP3, WAV).

**Attributes:**

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `loop` | integer | 1 | Repeat count (0 = infinite) |

```xml
<Response>
    <Play loop="0">https://example.com/hold-music.mp3</Play>
</Response>
```

### Gather

Collects DTMF or speech input.

**Attributes:**

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `action` | string | Required | Callback URL for collected input |
| `method` | string | POST | HTTP method for action URL |
| `inputType` | string | - | `dtmf`, `speech`, or `dtmf speech` |
| `executionTimeout` | integer | 15 | Input detection duration (5-60s) |
| `digitEndTimeout` | string | auto | Gap between digits (2-10s or `auto`) |
| `speechEndTimeout` | string | auto | Silence detection (2-10s or `auto`) |
| `finishOnKey` | string | # | Submission trigger digit (0-9, *, #, `none`) |
| `numDigits` | integer | 32 | Maximum digits (1-32) |
| `speechModel` | string | default | `command_and_search`, `phone_call`, `telephony` |
| `language` | string | en-US | Speech recognition language |
| `profanityFilter` | boolean | false | Mask offensive language |
| `log` | boolean | true | Enable input logging |
| `redirect` | boolean | true | Redirect vs. request-only |

**Nested Elements:** `<Speak>`, `<Play>` (for prompting)

**Action URL Callback Parameters:**

| Parameter | Description |
|-----------|-------------|
| `InputType` | Type of input received |
| `Digits` | DTMF digits collected |
| `Speech` | Recognized speech text |
| `SpeechConfidenceScore` | 0.0-1.0 confidence |
| `BilledAmount` | Speech recognition cost |

**Interim Callback Parameters:**

| Parameter | Description |
|-----------|-------------|
| `StableSpeech` | Confirmed speech |
| `UnstableSpeech` | Provisional speech |
| `Stability` | 0.0-1.0 stability score |
| `SequenceNumber` | Callback sequence |

```xml
<Response>
    <Gather action="https://example.com/handle-input" method="POST"
            inputType="dtmf" numDigits="1" timeout="10">
        <Speak>Press 1 for sales, 2 for support.</Speak>
    </Gather>
</Response>
```

### Dial

Connects caller to phone numbers or SIP endpoints. Requires nested `<Number>` or `<User>` element.

**Attributes:**

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `action` | string | - | Callback URL after Dial completion |
| `method` | string | POST | HTTP method |
| `hangupOnStar` | boolean | false | Allow * to hang up |
| `timeLimit` | integer | 14400 | Max call duration (seconds, 4 hours default) |
| `timeout` | integer | - | Time for called party to answer |
| `callerId` | string | - | Override caller number |
| `callerName` | string | - | Override caller name (max 50 chars) |
| `confirmSound` | string | - | URL returning XML with Play/Wait/Speak |
| `confirmTimeout` | string | 120 | Timeout after answer (seconds) |
| `confirmKey` | string | - | Digit to accept call (0-9, #, *) |
| `dialMusic` | string | - | Hold music URL or `real` for ringtone |
| `callbackUrl` | string | - | Event notification URL |
| `callbackMethod` | string | POST | HTTP method for callbackUrl |
| `redirect` | boolean | true | Redirect to action URL |
| `digitsMatch` | string | - | Digit patterns for A leg matching |
| `digitsMatchBLeg` | string | - | Digit patterns for B leg matching |
| `sipHeaders` | string | - | Custom SIP headers (key=value, comma-separated) |

**Action URL Parameters:** `DialRingStatus`, `DialHangupCause`, `DialStatus` (completed/busy/failed/cancel/timeout/no-answer), `DialALegUUID`, `DialBLegUUID`

**Callback URL Parameters:** `DialAction` (answer/connected/hangup/digits), `DialBLegStatus`, `DialALegUUID`, `DialBLegUUID`, `DialDigitsMatch`, `DialDigitsPressedBy`, `DialBLegDuration`, `DialBLegBillDuration`, `DialBLegFrom`, `DialBLegTo`, `DialBLegHangupCauseName`, `DialBLegHangupCauseCode`, `DialBLegHangupSource`, `STIRVerification`

#### Number Element (nested in Dial)

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `sendDigits` | string | - | DTMF tones on answer (`w` = 0.5s pause) |
| `sendOnPreanswer` | boolean | false | Send digits during early media |

#### User Element (nested in Dial)

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `sendDigits` | string | - | DTMF tones on answer (`w` = 0.5s pause) |
| `sendOnPreanswer` | boolean | false | Send digits during early media |
| `sipHeaders` | string | - | Custom SIP headers (prefixed `X-VH-`) |

```xml
<Response>
    <Dial callerId="14155551234" timeout="30">
        <Number sendDigits="wwww2410">15671234567</Number>
        <User>sip:alice@sip.vobiz.ai</User>
    </Dial>
</Response>
```

### Record

Captures call audio.

**Attributes:**

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `action` | string | Required | Callback URL for recording parameters |
| `method` | string | POST | HTTP method |
| `fileFormat` | string | mp3 | `mp3` or `wav` |
| `redirect` | boolean | false | Execute XML from action URL |
| `timeout` | integer | 60 | Max recording duration (seconds) |
| `maxLength` | integer | 60 | Max length (seconds) |
| `playBeep` | boolean | true | Beep before recording |
| `finishOnKey` | string | 1234567890*# | Key that stops recording |
| `recordSession` | boolean | false | Record entire session |
| `startOnDialAnswer` | boolean | false | Start on outbound answer |
| `transcriptionType` | string | auto | `auto` or `hybrid` (extra cost) |
| `transcriptionUrl` | string | - | Callback for transcription delivery |
| `transcriptionMethod` | string | POST | HTTP method for transcription URL |
| `callbackUrl` | string | - | Notification when recording file ready |
| `callbackMethod` | string | POST | HTTP method for callback |

**Action/Callback URL Parameters:** `RecordUrl`, `RecordingDuration`, `RecordingDurationMs`, `RecordingStartMs`, `RecordingEndMs`, `RecordingID`, `RecordingEndReason` (RecordingTimeout/maxLength/FinishedOnKey/HungUp)

**Transcription URL Parameters:** `transcription`, `transcription_id`, `transcription_url`, `recording_id`

```xml
<Response>
    <Speak>Please leave a message after the beep.</Speak>
    <Record action="https://example.com/recording-complete"
            maxLength="120" fileFormat="mp3"
            transcriptionType="auto"
            transcriptionUrl="https://example.com/transcription"/>
</Response>
```

### Hangup

Ends a call.

**Attributes:**

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `reason` | string | - | `rejected` or `busy` |
| `schedule` | integer | - | Delay before hangup (seconds, > 0) |

When first element: terminates with `rejected` by default. When not first: terminates with `Normal Hangup`.

```xml
<Response>
    <Hangup reason="busy"/>
</Response>
```

### Redirect

Transfers call control to a different URL. Any following elements are ignored.

**Attributes:**

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `method` | string | POST | HTTP method |

**Parameters sent in redirect request:** `From`, `To`, `Event` ("Redirect"), `CallUUID`, `CallerName`, `Direction`, `CallStatus`

```xml
<Response>
    <Redirect method="POST">https://example.com/new-handler</Redirect>
</Response>
```

### Wait

Pauses silently.

**Attributes:**

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `length` | integer | 1 | Duration in seconds |
| `silence` | boolean | false | End early on silence detection |
| `minSilence` | integer | 2000 | Required silence (ms, only when silence=true) |
| `beep` | boolean | false | Voicemail machine detection |

```xml
<Response>
    <Wait length="5"/>
</Response>
```

### Conference (XML Element)

Connects caller to a conference room. Rooms auto-create if they don't exist.

```xml
<Response>
    <Speak>You are joining the conference now.</Speak>
    <Conference>MyConferenceRoom</Conference>
</Response>
```

### DTMF (XML Element)

Sends digits on a live call.

**Attributes:**

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `async` | boolean | true | Proceed to next element after first digit sent |

**Allowed values:** 1234567890*#wW (`w` = 0.5s delay, `W` = 1s delay)

```xml
<Response>
    <DTMF>1234</DTMF>
</Response>
```

### PreAnswer

Early media mode -- play audio/speak before formally answering. No attributes.

**Supported nested elements:** `<Play>`, `<Speak>`, `<Wait>`

Not all phone numbers support this. Browser SDK does not support early media.

```xml
<Response>
    <PreAnswer>
        <Speak>Please wait while we connect you.</Speak>
    </PreAnswer>
</Response>
```

### Stream

Real-time audio transmission via WebSocket.

**Attributes:**

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `bidirectional` | boolean | false | Enable read/write audio |
| `audioTrack` | string | inbound | `inbound`, `outbound`, `both` |
| `streamTimeout` | integer | 86400 | Max streaming duration (seconds) |
| `statusCallbackUrl` | string | - | Lifecycle notification URL |
| `statusCallbackMethod` | string | POST | HTTP method |
| `contentType` | string | audio/x-l16;rate=8000 | Codec: `audio/x-l16;rate=8000/16000`, `audio/x-mulaw;rate=8000` |
| `extraHeaders` | string | - | Custom key-value pairs (max 512 bytes) |
| `keepCallAlive` | boolean | false | Wait for stream disconnect before continuing XML |

**Status Callback Events:** `StartStream`, `PlayedStream`, `StopStream`

**Callback Parameters:** `CallUUID`, `StreamID`, `Event`, `From`, `To`, `Timestamp`, `Name`, `ServiceURL`

```xml
<!-- Basic one-way stream -->
<Response>
    <Stream>wss://stream.vobiz.ai/stream</Stream>
</Response>

<!-- Bidirectional with callbacks -->
<Response>
    <Stream bidirectional="true" keepCallAlive="true"
        statusCallbackUrl="https://yourapp.com/stream-status"
        contentType="audio/x-l16;rate=16000">
        wss://stream.vobiz.ai/stream
    </Stream>
</Response>

<!-- Both tracks with timeout -->
<Response>
    <Stream audioTrack="both" streamTimeout="3600"
        statusCallbackUrl="https://yourapp.com/stream-status"
        extraHeaders="session=abc123,user=john">
        wss://stream.vobiz.ai/stream
    </Stream>
    <Speak>Thank you for calling.</Speak>
</Response>
```

---

## Appendix: Complete Endpoint Catalog

### Account
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/auth/me` | Retrieve account details |

### Sub-Accounts
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/accounts/{auth_id}/sub-accounts/` | Create subaccount |
| GET | `/api/v1/accounts/{auth_id}/sub-accounts/{sub_auth_id}` | Retrieve subaccount |
| PUT | `/api/v1/accounts/{auth_id}/sub-accounts/{sub_auth_id}` | Update subaccount |
| DELETE | `/api/v1/accounts/{auth_id}/sub-accounts/{sub_auth_id}` | Delete subaccount |
| GET | `/api/v1/accounts/{auth_id}/sub-accounts/` | List all subaccounts |

### Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/Account/{authID}/Application/` | Create application |
| GET | `/api/v1/Account/{authID}/Application/{appID}/` | Retrieve application |
| POST | `/api/v1/Account/{authID}/Application/{appID}/` | Update application |
| DELETE | `/api/v1/Account/{authID}/Application/{appID}/` | Delete application |

### Phone Numbers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/account/{auth_id}/numbers` | List account phone numbers |
| GET | `/api/v1/account/{auth_id}/inventory/numbers` | List inventory numbers |
| POST | `/api/v1/account/{auth_id}/numbers/purchase-from-inventory` | Purchase number |
| DELETE | `/api/v1/account/{auth_id}/numbers/{e164_number}` | Release number |

### SIP Trunks
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/account/{auth_id}/trunks` | Create trunk |
| GET | `/api/v1/account/{auth_id}/trunks/{trunk_id}` | Retrieve trunk |
| PUT | `/api/v1/account/{auth_id}/trunks/{trunk_id}` | Update trunk |
| DELETE | `/api/v1/account/{auth_id}/trunks/{trunk_id}` | Delete trunk |

### Trunk Credentials
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/account/{auth_id}/credentials` | Create credential |
| GET | `/api/v1/account/{auth_id}/trunks/credentials` | List all credentials |
| PUT | `/api/v1/account/{auth_id}/credentials/{credential_id}` | Update credential |
| DELETE | `/api/v1/account/{auth_id}/credentials/{credential_id}` | Delete credential |

### Origination URIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/account/{auth_id}/origination-uris` | Create origination URI |
| GET | `/api/v1/account/{auth_id}/trunks/origination-uris` | List all origination URIs |
| PUT | `/api/v1/account/{auth_id}/origination-uris/{uri_id}` | Update origination URI |
| DELETE | `/api/v1/account/{auth_id}/origination-uris/{uri_id}` | Delete origination URI |

### SIP Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/Account/{authID}/Endpoint/` | Create endpoint |
| GET | `/api/v1/Account/{authID}/Endpoint/{endpointID}/` | Retrieve endpoint |
| POST | `/api/v1/Account/{authID}/Endpoint/{endpointID}/` | Update endpoint |
| DELETE | `/api/v1/Account/{authID}/Endpoint/{endpointID}/` | Delete endpoint |
| GET | `/api/v1/Account/{authID}/Endpoint/` | List all endpoints |

### Calls
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/Account/{auth_id}/Call/` | Make a call |
| POST | `/api/v1/Account/{auth_id}/Call/{call_uuid}/` | Transfer a call |
| DELETE | `/api/v1/Account/{auth_id}/Call/{call_uuid}/` | Hang up a call |
| GET | `/api/v1/account/{auth_id}/call/{callUuid}/?status=live` | Retrieve live call |
| GET | `/api/v1/account/{auth_id}/call/?status=live` | Retrieve all live calls |
| GET | `/api/v1/account/{auth_id}/call/{callUuid}/?status=queued` | Retrieve queued call |
| GET | `/api/v1/account/{auth_id}/call/?status=queued` | Retrieve all queued calls |

### Call Audio
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/Account/{auth_id}/Call/{call_uuid}/Play/` | Play audio |
| DELETE | `/api/v1/Account/{auth_id}/Call/{call_uuid}/Play/` | Stop audio |
| POST | `/api/v1/Account/{auth_id}/Call/{call_uuid}/Speak/` | Speak text (TTS) |
| DELETE | `/api/v1/Account/{auth_id}/Call/{call_uuid}/Speak/` | Stop speaking |
| POST | `/api/v1/Account/{auth_id}/Call/{call_uuid}/DTMF/` | Send DTMF digits |

### Audio Streams
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/Account/{auth_id}/Call/{call_uuid}/Stream/` | Start audio stream |
| GET | `/api/v1/Account/{auth_id}/Call/{call_uuid}/Stream/{stream_id}/` | Retrieve stream |
| GET | `/api/v1/Account/{auth_id}/Call/{call_uuid}/Stream/` | List streams |
| DELETE | `/api/v1/Account/{auth_id}/Call/{call_uuid}/Stream/{stream_id}/` | Stop stream |
| DELETE | `/api/v1/Account/{auth_id}/Call/{call_uuid}/Stream/` | Stop all streams |

### Recordings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/Account/{auth_id}/Recording/{recording_id}/` | Retrieve recording |
| GET | `/api/v1/Account/{auth_id}/Recording/` | List all recordings |
| GET | `media.vobiz.ai/v1/Account/{Auth_ID}/Recording/{recording_id}.wav` | Download recording |
| DELETE | `/api/v1/Account/{auth_id}/Recording/{recording_id}/` | Delete recording |

### CDR
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/account/{account_id}/cdr` | List CDRs |
| GET | `/api/v1/account/{account_id}/cdr/{call_id}` | Get single CDR |
| GET | `/api/v1/account/{account_id}/cdr/search` | Search CDRs |
| GET | `/api/v1/account/{account_id}/cdr/recent` | Recent CDRs |
| GET | `/api/v1/account/{account_id}/cdr/export` | Export CSV |

### Conferences
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/Account/{auth_id}/Conference/{conference_name}/` | Retrieve conference |
| DELETE | `/api/v1/Account/{auth_id}/Conference/{conference_name}/` | Hang up conference |
| DELETE | `/api/v1/Account/{auth_id}/Conference/` | Hang up all conferences |
