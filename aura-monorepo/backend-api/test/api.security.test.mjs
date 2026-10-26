import test from 'node:test';
import assert from 'node:assert/strict';

const base = (process.env.API_URL || '').replace(/\/$/, '');
const request = (path, options = {}) => fetch(`${base}${path}`, options);
const json = (body) => ({ 'Content-Type': 'application/json', ...body });
const bearer = (token) => ({ Authorization: `Bearer ${token}` });

test('API security smoke tests (requires API_URL and a running seeded database)', {
  skip: !base ? 'API_URL is not set; integration environment not available' : false,
}, async (t) => {
  const health = await request('/health');
  assert.ok([200, 503].includes(health.status));
  const unauth = await request('/incidents');
  assert.equal(unauth.status, 401);
  const origin = await request('/health', { headers: { Origin: 'https://evil.example' } });
  assert.equal(origin.status, 403);

  if (process.env.TEST_CITIZEN_TOKEN) {
    const forbidden = await request('/responder/incidents', { headers: bearer(process.env.TEST_CITIZEN_TOKEN) });
    assert.equal(forbidden.status, 403);
  } else t.diagnostic('NOT RUN: citizen responder-role check needs TEST_CITIZEN_TOKEN');

  if (process.env.TEST_VERIFIED_PHONE && process.env.TEST_UNKNOWN_PHONE) {
    const known = await request('/auth/login/request-otp', { method: 'POST', headers: json({}), body: JSON.stringify({ phoneNumber: process.env.TEST_VERIFIED_PHONE }) });
    const unknown = await request('/auth/login/request-otp', { method: 'POST', headers: json({}), body: JSON.stringify({ phoneNumber: process.env.TEST_UNKNOWN_PHONE }) });
    assert.equal(known.status, unknown.status);
    assert.deepEqual(await known.json(), await unknown.json());
  } else t.diagnostic('NOT RUN: account-enumeration check needs TEST_VERIFIED_PHONE and TEST_UNKNOWN_PHONE');

  if (process.env.TEST_OTP_LIMIT_PHONE) {
    let last;
    for (let i = 0; i < 4; i++) last = await request('/auth/login/request-otp', { method: 'POST', headers: json({}), body: JSON.stringify({ phoneNumber: process.env.TEST_OTP_LIMIT_PHONE }) });
    assert.equal(last.status, 429);
  } else t.diagnostic('NOT RUN: 4th-send cap check needs a verified TEST_OTP_LIMIT_PHONE with a fresh 10-minute window');

  if (process.env.TEST_CITIZEN_TOKEN && process.env.TEST_OTHER_CITIZEN_TOKEN) {
    const headers = { ...bearer(process.env.TEST_CITIZEN_TOKEN), 'Content-Type': 'application/json' };
    const payload = { category: 'smoke check', threatLevel: 'medium', latitude: -26.2041, longitude: 28.0473 };
    const first = await request('/incidents', { method: 'POST', headers, body: JSON.stringify(payload) });
    assert.ok([200, 201].includes(first.status));
    const firstData = await first.json();
    const second = await request('/incidents', { method: 'POST', headers, body: JSON.stringify(payload) });
    assert.ok([200, 201].includes(second.status));
    const secondData = await second.json();
    assert.equal(firstData.incident.id, secondData.incident.id);
    const crossUser = await request(`/incidents/${firstData.incident.id}`, { headers: bearer(process.env.TEST_OTHER_CITIZEN_TOKEN) });
    assert.equal(crossUser.status, 404);
  } else t.diagnostic('NOT RUN: idempotency/cross-user checks need TEST_CITIZEN_TOKEN and TEST_OTHER_CITIZEN_TOKEN');
});
