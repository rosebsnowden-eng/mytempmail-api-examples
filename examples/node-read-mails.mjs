const BASE_URL = process.env.MYTEMPMAIL_BASE_URL || 'https://api.mytempmail.cc';
const DOMAIN = process.env.MYTEMPMAIL_DOMAIN || 'nilvaro.com';
const FINGERPRINT = process.env.MYTEMPMAIL_FINGERPRINT || 'docs-example-node';
const EXPIRY = Number(process.env.MYTEMPMAIL_EXPIRY || 1800);
const POLL_SECONDS = Number(process.env.MYTEMPMAIL_POLL_SECONDS || 10);
const MAX_ATTEMPTS = Number(process.env.MYTEMPMAIL_MAX_ATTEMPTS || 6);

async function requestJson(path, init = {}) {
  const response = await fetch(`${BASE_URL}${path}`, init);
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(`${init.method || 'GET'} ${path} failed: ${response.status} ${JSON.stringify(body)}`);
  }

  return body;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function createInbox() {
  return requestJson('/api/address', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-fingerprint': FINGERPRINT
    },
    body: JSON.stringify({
      domain: DOMAIN,
      expiry: EXPIRY
    })
  });
}

async function listMails(token) {
  return requestJson(`/api/mails/${encodeURIComponent(token)}?limit=10`);
}

async function readMail(token, id) {
  return requestJson(
    `/api/mail/${encodeURIComponent(token)}/${encodeURIComponent(id)}`
  );
}

try {
  const inbox = await createInbox();

  console.log(`Created inbox: ${inbox.address}`);
  console.log('Send a test email to this address, then wait for polling.');

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const mails = await listMails(inbox.token);

    console.log(
      `Poll ${attempt}/${MAX_ATTEMPTS}: ${mails.count} message(s) found`
    );

    if (mails.results.length > 0) {
      const first = mails.results[0];
      const detail = await readMail(inbox.token, first.id);

      console.log('');
      console.log('Latest message');
      console.log(`From: ${detail.from_name || ''} <${detail.from_address}>`);
      console.log(`Subject: ${detail.subject || '(no subject)'}`);
      console.log(`Received at: ${detail.received_at}`);
      console.log('');
      console.log(detail.text_body || '[No text body]');
      process.exit(0);
    }

    if (attempt < MAX_ATTEMPTS) {
      await wait(POLL_SECONDS * 1000);
    }
  }

  console.log('No messages arrived during the polling window.');
} catch (error) {
  console.error(error.message);
  if (error.cause?.code === 'ENOTFOUND') {
    console.error(
      `DNS lookup failed for ${error.cause.hostname}. Check your network DNS settings and retry.`
    );
  }
  process.exitCode = 1;
}
