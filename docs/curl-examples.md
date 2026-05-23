# curl Examples

Copyable terminal examples for the MyTempMail public API.

Base URL:

```bash
https://api.mytempmail.cc
```

## Get Public Settings

```bash
curl -s https://api.mytempmail.cc/api/settings
```

## Create a Temporary Inbox

```bash
curl -s -X POST https://api.mytempmail.cc/api/address \
  -H "Content-Type: application/json" \
  -H "x-fingerprint: docs-example-curl" \
  -d '{
    "domain": "nilvaro.com",
    "expiry": 1800
  }'
```

Example response:

```json
{
  "token": "mailbox-token",
  "address": "abc12@nilvaro.com",
  "expires_in": 1800,
  "verified": false
}
```

## Check Inbox Status

```bash
curl -s https://api.mytempmail.cc/api/address/YOUR_TOKEN
```

## List Messages

```bash
curl -s "https://api.mytempmail.cc/api/mails/YOUR_TOKEN?limit=10"
```

## Read One Message

```bash
curl -s https://api.mytempmail.cc/api/mail/YOUR_TOKEN/EMAIL_ID
```

## Refresh an Inbox

```bash
curl -s -X POST https://api.mytempmail.cc/api/address/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_TOKEN",
    "expiry": 1800
  }'
```

Free inboxes can currently be refreshed once.

## Delete One Message

```bash
curl -s -X DELETE https://api.mytempmail.cc/api/mail/YOUR_TOKEN/EMAIL_ID
```

## Error Responses

Common API errors:

```json
{ "error": "Verification required", "code": "TURNSTILE_REQUIRED" }
```

```json
{ "error": "Rate limit exceeded", "code": "RATE_LIMITED" }
```

```json
{ "error": "Address not found or expired" }
```

Use a 10-second or slower polling interval to stay within public API limits.
