import { createSign } from 'node:crypto';
import db from '../config/db.js';
import { env } from '../config/env.js';

const b64url = (value) => Buffer.from(value).toString('base64url');
let cachedAccessToken = null;
let cachedTokenExpiry = 0;

async function getAccessToken(account) {
  if (cachedAccessToken && Date.now() < cachedTokenExpiry - 60_000) return cachedAccessToken;
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64url(JSON.stringify({ iss: account.client_email, scope: 'https://www.googleapis.com/auth/firebase.messaging', aud: account.token_uri || 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 }));
  const signer = createSign('RSA-SHA256'); signer.update(`${header}.${claim}`);
  const assertion = `${header}.${claim}.${signer.sign(account.private_key, 'base64url')}`;
  const response = await fetch(account.token_uri || 'https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }) });
  if (!response.ok) throw new Error('FCM auth failed');
  const data = await response.json(); cachedAccessToken = data.access_token; cachedTokenExpiry = Date.now() + Number(data.expires_in || 3600) * 1000; return cachedAccessToken;
}

export async function sendNotice(userId) {
  const result = await db.query('SELECT id, token FROM device_tokens WHERE user_id=$1', [userId]);
  for (const device of result.rows) {
    try {
      if (env.PUSH_PROVIDER !== 'fcm') {
        console.info('[guardian-push:console]', { tokenPrefix: `${device.token.slice(0, 6)}…`, payloadKeys: ['title', 'body', 'data'] });
        await db.query('UPDATE nearby_alerts SET delivered_at=COALESCE(delivered_at,now()) WHERE recipient_user_id=$1 AND status=\'open\' AND delivered_at IS NULL', [userId]);
        continue;
      }
      const account = JSON.parse(Buffer.from(env.FCM_SERVICE_ACCOUNT_B64, 'base64').toString('utf8'));
      const accessToken = await getAccessToken(account);
      const response = await fetch(`https://fcm.googleapis.com/v1/projects/${encodeURIComponent(env.FCM_PROJECT_ID)}/messages:send`, { method: 'POST', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify({ message: { token: device.token, notification: { title: 'Daily Planner', body: 'New notice near you' }, data: { type: 'notice' }, android: { priority: 'high' } } }) });
      if (!response.ok) {
        const body = await response.text();
        if (/UNREGISTERED|registration-token-not-registered/i.test(body)) await db.query('DELETE FROM device_tokens WHERE id=$1', [device.id]);
        else console.warn('[guardian-push] provider request failed', { status: response.status });
      } else await db.query('UPDATE nearby_alerts SET delivered_at=COALESCE(delivered_at,now()) WHERE recipient_user_id=$1 AND status=\'open\' AND delivered_at IS NULL', [userId]);
    } catch { console.warn('[guardian-push] delivery failed'); }
  }
}
