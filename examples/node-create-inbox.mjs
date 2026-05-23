const BASE_URL = process.env.MYTEMPMAIL_BASE_URL || 'https://api.mytempmail.cc';
const DOMAIN = process.env.MYTEMPMAIL_DOMAIN || 'nilvaro.com';
const FINGERPRINT = process.env.MYTEMPMAIL_FINGERPRINT || 'docs-example-node';
const EXPIRY = Number(process.env.MYTEMPMAIL_EXPIRY || 1800);

async function readJson(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

async function createInbox() {
  const response = await fetch(`${BASE_URL}/api/address`, {
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

  const body = await readJson(response);

  if (!response.ok) {
    throw new Error(
      `Create inbox failed: ${response.status} ${JSON.stringify(body)}`
    );
  }

  return body;
}

try {
  const inbox = await createInbox();

  console.log('Temporary inbox created');
  console.log(`Address: ${inbox.address}`);
  console.log(`Token: ${inbox.token}`);
  console.log(`Expires in: ${inbox.expires_in} seconds`);
  console.log('');
  console.log('Keep the token private while the mailbox is active.');
} catch (error) {
  console.error(error.message);
  if (error.cause?.code === 'ENOTFOUND') {
    console.error(
      `DNS lookup failed for ${error.cause.hostname}. Check your network DNS settings and retry.`
    );
  }
  process.exitCode = 1;
}
