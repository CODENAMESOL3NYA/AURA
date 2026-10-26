import test from 'node:test';
import assert from 'node:assert/strict';
const base = (process.env.API_URL || '').replace(/\/$/, '');
const guardian = process.env.NEARBY_GUARDIAN_TOKEN;
const victim = process.env.NEARBY_VICTIM_TOKEN;
const other = process.env.NEARBY_OTHER_TOKEN;
const headers = (token) => ({ authorization: `Bearer ${token}`, 'content-type': 'application/json' });
const request = (path, options = {}) => fetch(`${base}${path}`, options);

test('nearby API contract smoke (requires a configured API and seeded tokens)', { skip: !base || !guardian || !victim ? 'NOT RUN: set API_URL, NEARBY_GUARDIAN_TOKEN and NEARBY_VICTIM_TOKEN' : false }, async (t) => {
  const noConsent = await request('/api/v1/guardian/settings', { method: 'PUT', headers: headers(guardian), body: JSON.stringify({ enabled: true, radiusM: 1000 }) });
  assert.equal(noConsent.status, 400, 'enabling without explicit consent must fail');
  const enable = await request('/api/v1/guardian/settings', { method: 'PUT', headers: headers(guardian), body: JSON.stringify({ enabled: true, radiusM: 1000, consent: true }) });
  assert.equal(enable.status, 200);
  const fix = { latitude: -26.2041, longitude: 28.0473, accuracy: 40 };
  const first = await request('/api/v1/guardian/presence', { method: 'POST', headers: headers(guardian), body: JSON.stringify(fix) });
  assert.equal(first.status, 204);
  const second = await request('/api/v1/guardian/presence', { method: 'POST', headers: headers(guardian), body: JSON.stringify(fix) });
  assert.equal(second.status, 429, 'presence writes within 30 seconds must be throttled');
  const alertsResponse = await request('/api/v1/guardian/alerts', { headers: headers(guardian) });
  assert.equal(alertsResponse.status, 200);
  const body = await alertsResponse.json();
  assert.ok(Array.isArray(body.alerts));
  for (const alert of body.alerts) {
    assert.deepEqual(Object.keys(alert).sort(), ['areaLat', 'areaLng', 'createdAt', 'distanceBand', 'id'].sort());
    assert.equal('latitude' in alert || 'longitude' in alert || 'distance' in alert || 'phone' in alert || 'name' in alert, false);
  }
  if (other && process.env.NEARBY_FOREIGN_ALERT_ID) {
    const crossUser = await request(`/api/v1/guardian/alerts/${process.env.NEARBY_FOREIGN_ALERT_ID}/dismiss`, { method: 'POST', headers: headers(other), body: '{}' });
    assert.equal(crossUser.status, 404);
  } else t.diagnostic('NOT RUN: cross-user dismiss requires NEARBY_OTHER_TOKEN and NEARBY_FOREIGN_ALERT_ID');
});
