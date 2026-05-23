# API Workflows

This document explains common MyTempMail API workflows for developers and QA teams.

## 1. Create a Disposable Inbox

Use `POST /api/address` to create a receive-only temporary email address.

Recommended request body:

```json
{
  "domain": "nilvaro.com",
  "expiry": 1800
}
```

The response includes:

- `address`: the temporary email address to use in a form
- `token`: a private mailbox token used to read messages
- `expires_in`: mailbox lifetime in seconds

Keep the token private while the mailbox is active.

## 2. Poll for Verification Emails

Use `GET /api/mails/:token?limit=10` to list incoming messages.

Recommended behavior:

- Poll every 10 seconds or slower.
- Stop polling after the expected message arrives.
- Stop polling when the mailbox expires.
- Do not create multiple inboxes just to speed up polling.

## 3. Read One Message

Use `GET /api/mail/:token/:id` after a message appears in the list.

This endpoint returns the full message body and attachment metadata.

Temporary email is not a secure long-term mailbox. Do not use it to store passwords, sensitive documents, financial information, or recovery credentials.

## 4. Refresh a Mailbox

Use `POST /api/address/refresh` to extend an active mailbox.

Free public inboxes can currently be refreshed once. This is useful when a verification email is delayed, but it should not be used for permanent accounts.

## 5. Delete a Message

Use `DELETE /api/mail/:token/:id` to delete one message from the active mailbox.

This can be useful in tests that need a clean inbox state after reading the expected message.

## 6. Automated Signup Testing

A common testing flow:

1. Create a temporary inbox.
2. Fill the signup form with the generated address.
3. Submit the form.
4. Poll the inbox every 10 seconds.
5. Read the verification message.
6. Extract the verification link or code.
7. Continue the test.

The Playwright example in this repository demonstrates steps 1 through 5. You can adapt it to parse verification links from `text_body` or `html_body` after reading a message by ID.

## 7. Limits and Anti-Abuse Behavior

The public API is intentionally rate-limited. If you receive `RATE_LIMITED`, wait before trying again.

Turnstile verification may be required when abuse protection is triggered, but solving a challenge does not grant more free addresses. Higher-volume developer access should be handled through a future API token or paid plan rather than browser verification.

## 8. Production Notes

For production integrations:

- Treat mailbox tokens like secrets.
- Avoid logging tokens in public CI output.
- Use stable fingerprints for browser-based flows.
- Use conservative polling intervals.
- Build fallback behavior for delayed, blocked, or missing email delivery.
- Prefer real user email addresses for permanent account recovery.
