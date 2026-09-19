// SendPulse subscription endpoint for RM CREATIVES Insights.
const ADDRESS_BOOK_ID = '900922';
const SENDPULSE_API = 'https://api.sendpulse.com';

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store'
  },
  body: JSON.stringify(body)
});

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { ok: false, error: 'Method not allowed' });
  }

  const clientId = process.env.SENDPULSE_CLIENT_ID;
  const clientSecret = process.env.SENDPULSE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('SendPulse credentials are not configured');
    return json(503, { ok: false, error: 'Subscription service is not configured' });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { ok: false, error: 'Invalid request' });
  }

  const email = String(payload.email || '').trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return json(400, { ok: false, error: 'Invalid email' });
  }

  try {
    const tokenResponse = await fetch(`${SENDPULSE_API}/oauth/access_token`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret
      })
    });

    const tokenData = await tokenResponse.json().catch(() => ({}));
    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error('SendPulse token error', tokenResponse.status, tokenData);
      return json(502, { ok: false, error: 'Subscription provider unavailable' });
    }

    const subscribeResponse = await fetch(`${SENDPULSE_API}/addressbooks/${ADDRESS_BOOK_ID}/emails`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${tokenData.access_token}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({ emails: [email] })
    });

    const subscribeData = await subscribeResponse.json().catch(() => ({}));
    if (!subscribeResponse.ok || subscribeData.result !== true) {
      console.error('SendPulse subscribe error', subscribeResponse.status, subscribeData);
      return json(502, { ok: false, error: 'Could not add subscriber' });
    }

    return json(200, { ok: true });
  } catch (error) {
    console.error('SendPulse subscription exception', error);
    return json(502, { ok: false, error: 'Subscription provider unavailable' });
  }
};
