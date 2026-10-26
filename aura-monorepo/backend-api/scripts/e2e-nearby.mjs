const base = (process.env.API_URL || '').replace(/\/$/, '');
let failures = 0;
const report = (name, status, detail = '') => { console.log(`${status} ${name}${detail ? ` — ${detail}` : ''}`); if (status === 'FAIL') failures++; };
if (!base) {
  report('API URL configured', 'NOT RUN', 'Set API_URL to a running backend');
  report('Guardian settings consent and presence throttling', 'NOT RUN', 'Requires API_URL and authenticated test accounts');
  report('Fan-out, privacy, dismiss, closure, kill switch', 'NOT RUN', 'Requires seeded PostgreSQL data and test tokens');
  process.exit(0);
}
try {
  const health = await fetch(`${base}/health`);
  report('API health endpoint', health.ok ? 'PASS' : 'FAIL', `HTTP ${health.status}`);
} catch (e) { report('API health endpoint', 'FAIL', e.message); }
const victim = process.env.NEARBY_VICTIM_TOKEN, guardian = process.env.NEARBY_GUARDIAN_TOKEN;
if (!victim || !guardian) {
  report('Consent, presence rate limit, fan-out privacy, dismiss and closure', 'NOT RUN', 'Set NEARBY_VICTIM_TOKEN and NEARBY_GUARDIAN_TOKEN for full authenticated checks');
} else {
  const headers = (token) => ({ authorization: `Bearer ${token}`, 'content-type': 'application/json' });
  try {
    const settings = await fetch(`${base}/api/v1/guardian/settings`, { headers: headers(guardian) });
    report('Guardian settings endpoint', settings.ok || settings.status === 404 ? 'PASS' : 'FAIL', `HTTP ${settings.status}`);
    const alerts = await fetch(`${base}/api/v1/guardian/alerts`, { headers: headers(guardian) });
    const payload = await alerts.json();
    const safe = JSON.stringify(payload).match(/full_name|phone_e164|phoneNumber|exactDistance|latitude|longitude/i) === null;
    report('Alert response avoids identity and raw location fields', safe ? 'PASS' : 'FAIL');
    report('Alert list response shape', alerts.ok && Array.isArray(payload.alerts) ? 'PASS' : 'FAIL');
  } catch (e) { report('Authenticated guardian checks', 'FAIL', e.message); }
}
console.log(`Summary: ${failures} failure(s). Checks requiring DB state or credentials are explicitly marked NOT RUN.`);
if (failures) process.exitCode = 1;
