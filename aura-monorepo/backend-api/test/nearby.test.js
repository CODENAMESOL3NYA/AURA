import test from 'node:test';
import assert from 'node:assert/strict';
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL ||= 'postgres://test:test@localhost/test?sslmode=require';
process.env.JWT_SECRET ||= 'x'.repeat(32);
process.env.ID_ENC_KEY ||= 'a'.repeat(64);
process.env.ID_HASH_PEPPER ||= 'p'.repeat(20);
process.env.OTP_PEPPER ||= 'o'.repeat(20);
process.env.ALLOW_TEST_ENV = '1';
const { haversineMeters, snapToGrid, distanceBand, isUnderCap } = await import('../src/services/nearby-geo.js');

test('haversine distance is zero for the same point and plausible for 500 m', () => {
  assert.equal(haversineMeters(-26.2041, 28.0473, -26.2041, 28.0473), 0);
  const distance = haversineMeters(-26.2041, 28.0473, -26.2041, 28.0523);
  assert.ok(distance > 490 && distance < 510, `expected about 500 m, got ${distance}`);
});
test('grid snapping is deterministic and approximately grid-sized', () => {
  const a = snapToGrid(-26.2041, 28.0473, 250);
  const b = snapToGrid(-26.2041, 28.0473, 250);
  assert.deepEqual(a, b);
  assert.notEqual(a.areaLat, -26.2041);
  assert.notEqual(a.areaLng, 28.0473);
});
test('distance bands use only coarse labels', () => {
  assert.equal(distanceBand(499.9), 'under 500 m');
  assert.equal(distanceBand(500), '500 m to 1 km');
  assert.equal(distanceBand(1000), '500 m to 1 km');
  assert.equal(distanceBand(1001), '1 to 2 km');
});

test('hourly caps allow counts below the limit and stop at the limit', () => {
  assert.equal(isUnderCap(0, 3), true);
  assert.equal(isUnderCap(2, 3), true);
  assert.equal(isUnderCap(3, 3), false);
  assert.equal(isUnderCap(4, 3), false);
});
