# MyTempMail API Examples

Practical examples for using the public MyTempMail API to create disposable email inboxes, poll for verification emails, and test signup flows.

- Website: https://mytempmail.cc/
- API documentation: https://mytempmail.cc/developers/
- API base URL: `https://api.mytempmail.cc`

Use `https://api.mytempmail.cc` for API requests. The main website origin, `https://mytempmail.cc`, serves the web app and documentation.

## What This Repository Includes

- Node.js examples for creating inboxes and reading mail
- Browser `fetch` example for lightweight integrations
- Playwright example for signup-flow testing
- curl examples for quick terminal checks
- Workflow notes for temporary email automation

## API Status

The current public API is free and rate-limited. It does not require an API key yet.

Public limits may include:

- Up to 3 new addresses per IP
- Up to 3 new addresses per browser/device fingerprint
- 1 free mailbox refresh
- 10 messages per free mailbox
- Recommended polling interval: 10 seconds or slower

Turnstile verification can prove that a visitor is human, but it does not increase the free address quota. Higher-volume developer tokens are not publicly available yet.

## Quick Start

Requirements:

- Node.js 18 or newer
- npm

Install dependencies:

```bash
npm install
```

Create a temporary inbox:

```bash
npm run create
```

Create an inbox and poll for messages:

```bash
npm run read
```

Run the Playwright example after editing the target signup URL and selectors:

```bash
npm run test:signup
```

## Examples

### Create Inbox

```js
const response = await fetch('https://api.mytempmail.cc/api/address', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-fingerprint': 'docs-example-node'
  },
  body: JSON.stringify({
    domain: 'nilvaro.com',
    expiry: 1800
  })
});

const inbox = await response.json();
console.log(inbox.address, inbox.token);
```

### Poll Messages

```js
const response = await fetch(
  `https://api.mytempmail.cc/api/mails/${encodeURIComponent(token)}?limit=10`
);

const mails = await response.json();
console.log(mails.results);
```

## Endpoint Summary

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/settings` | Read public settings, domains, limits, and expiry options |
| `POST` | `/api/address` | Create a temporary inbox |
| `GET` | `/api/address/:token` | Check inbox status and expiration |
| `POST` | `/api/address/refresh` | Refresh an active inbox within the free limit |
| `GET` | `/api/mails/:token` | List messages for an inbox |
| `GET` | `/api/mail/:token/:id` | Read one message with full body and attachments metadata |
| `GET` | `/api/attachment/:token/:emailId/:attId` | Download an attachment |
| `DELETE` | `/api/mail/:token/:id` | Delete one message |

## Repository Files

- [`examples/node-create-inbox.mjs`](examples/node-create-inbox.mjs) creates one temporary inbox.
- [`examples/node-read-mails.mjs`](examples/node-read-mails.mjs) creates an inbox and polls for incoming messages.
- [`examples/browser-fetch-example.html`](examples/browser-fetch-example.html) shows a browser-only fetch integration.
- [`examples/playwright-signup-test.spec.ts`](examples/playwright-signup-test.spec.ts) shows how to use a temporary inbox in automated signup tests.
- [`docs/curl-examples.md`](docs/curl-examples.md) lists copyable curl commands.
- [`docs/api-workflows.md`](docs/api-workflows.md) explains common API workflows.

## Responsible Use

MyTempMail is intended for privacy protection, QA testing, trial signups, and low-risk verification. Do not use disposable inboxes for spam, abuse, account takeover, evading bans, credential storage, financial accounts, healthcare accounts, or long-term account recovery.

Temporary inboxes expire. Store the returned token privately while the mailbox is active; the token grants access to that mailbox.

## License

MIT
