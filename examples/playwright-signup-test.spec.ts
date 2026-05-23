import { expect, test } from '@playwright/test';

const BASE_URL = process.env.MYTEMPMAIL_BASE_URL || 'https://api.mytempmail.cc';
const DOMAIN = process.env.MYTEMPMAIL_DOMAIN || 'nilvaro.com';
const SIGNUP_URL = process.env.SIGNUP_URL || 'https://example.com/signup';
const EMAIL_SELECTOR = process.env.SIGNUP_EMAIL_SELECTOR || 'input[type="email"]';
const SUBMIT_SELECTOR = process.env.SIGNUP_SUBMIT_SELECTOR || 'button[type="submit"]';

type Inbox = {
  token: string;
  address: string;
  expires_in: number;
};

type MailSummary = {
  id: string;
  from_address: string;
  from_name?: string | null;
  subject?: string | null;
  received_at: number;
  has_attachments: number;
  raw_size: number;
};

async function createInbox(request): Promise<Inbox> {
  const response = await request.post(`${BASE_URL}/api/address`, {
    headers: {
      'x-fingerprint': 'docs-example-playwright'
    },
    data: {
      domain: DOMAIN,
      expiry: 1800
    }
  });

  expect(response.ok()).toBeTruthy();
  return response.json();
}

async function pollForMail(request, token: string): Promise<MailSummary | null> {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const response = await request.get(
      `${BASE_URL}/api/mails/${encodeURIComponent(token)}?limit=10`
    );

    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    if (body.results.length > 0) {
      return body.results[0];
    }

    await new Promise((resolve) => setTimeout(resolve, 10_000));
  }

  return null;
}

test('uses a MyTempMail inbox in a signup flow', async ({ page, request }) => {
  const inbox = await createInbox(request);

  await page.goto(SIGNUP_URL);
  await page.locator(EMAIL_SELECTOR).fill(inbox.address);
  await page.locator(SUBMIT_SELECTOR).click();

  const message = await pollForMail(request, inbox.token);

  expect(message, `No email arrived for ${inbox.address}`).not.toBeNull();
  expect(message?.subject || '').not.toEqual('');
});
