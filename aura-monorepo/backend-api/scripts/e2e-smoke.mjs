import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const base = (process.env.API_URL || 'http://127.0.0.1:5000/api/v1').replace(/\/$/, '');
const rl = readline.createInterface({ input, output });
const required = ['SMOKE_FULL_NAME', 'SMOKE_SA_ID', 'SMOKE_PHONE', 'SMOKE_RESPONDER_PHONE'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`NOT RUN: set ${missing.join(', ')} before running this script.`);
  process.exit(2);
}
let failed = false;
async function step(name, fn) {
  try { const value = await fn(); console.log(`PASS ${name}`); return value; }
  catch (error) { failed = true; console.error(`FAIL ${name}: ${error.message}`); throw error; }
}
async function call(path, { token, method = 'GET', body } = {}) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${method} ${path} returned HTTP ${response.status}: ${data.error || 'request failed'}`);
  return data;
}
async function askCode(label) {
  const code = (await rl.question(`${label} — enter the six-digit code from the SMS/console: `)).trim();
  if (!/^\d{6}$/.test(code)) throw new Error('Code must be six digits');
  return code;
}
try {
  await step('API health', async () => {
    const health = await call('/health');
    if (health.db !== 'up') throw new Error('database is not up');
  });
  await step('request signup OTP', () => call('/auth/register', { method: 'POST', body: { fullName: process.env.SMOKE_FULL_NAME, idNumber: process.env.SMOKE_SA_ID, phoneNumber: process.env.SMOKE_PHONE } }));
  const signupCode = await askCode('Signup OTP');
  let citizen = await step('verify signup OTP', () => call('/auth/verify-otp', { method: 'POST', body: { phoneNumber: process.env.SMOKE_PHONE, code: signupCode } }));
  await step('logout all sessions', () => call('/auth/logout-all', { method: 'POST', token: citizen.token, body: {} }));
  await step('request login OTP', () => call('/auth/login/request-otp', { method: 'POST', body: { phoneNumber: process.env.SMOKE_PHONE } }));
  const loginCode = await askCode('Citizen login OTP');
  citizen = await step('verify login OTP', () => call('/auth/login/verify-otp', { method: 'POST', body: { phoneNumber: process.env.SMOKE_PHONE, code: loginCode } }));
  const created = await step('create incident', () => call('/incidents', { method: 'POST', token: citizen.token, body: { category: 'smoke test', threatLevel: 'medium', latitude: -26.2041, longitude: 28.0473 } }));
  const incidentId = created.incident.id;
  await step('ping incident location', () => call(`/incidents/${incidentId}/location`, { method: 'POST', token: citizen.token, body: { latitude: -26.2042, longitude: 28.0474, accuracy: 20 } }));
  await step('request responder OTP', () => call('/auth/login/request-otp', { method: 'POST', body: { phoneNumber: process.env.SMOKE_RESPONDER_PHONE } }));
  const responderCode = await askCode('Responder login OTP');
  const responder = await step('verify responder login OTP and role', async () => {
    const value = await call('/auth/login/verify-otp', { method: 'POST', body: { phoneNumber: process.env.SMOKE_RESPONDER_PHONE, code: responderCode } });
    if (!['responder', 'admin'].includes(value.user.role)) throw new Error('configured responder phone is not promoted');
    return value;
  });
  await step('responder sees incident', async () => {
    const value = await call('/responder/incidents', { token: responder.token });
    if (!value.incidents.some((item) => item.id === incidentId)) throw new Error('new incident not found');
  });
  await step('responder acknowledges incident', () => call(`/responder/incidents/${incidentId}`, { method: 'PATCH', token: responder.token, body: { status: 'acknowledged' } }));
  await step('responder dispatches incident', () => call(`/responder/incidents/${incidentId}`, { method: 'PATCH', token: responder.token, body: { status: 'dispatched', assignedUnit: 'Smoke Unit', etaMinutes: 5 } }));
  await step('citizen tracker sees dispatched status', async () => {
    const value = await call(`/incidents/${incidentId}`, { token: citizen.token });
    if (value.incident.status !== 'dispatched') throw new Error(`expected dispatched, got ${value.incident.status}`);
  });
  await step('citizen cancels incident', () => call(`/incidents/${incidentId}/cancel`, { method: 'POST', token: citizen.token, body: {} }));
} catch {
  // The failed step has already emitted a concise result. Do not print tokens or submitted PII.
} finally {
  rl.close();
}
if (failed) process.exitCode = 1;
else console.log('E2E smoke sequence completed. Review the separate Twilio/contact-SMS checklist for delivery verification.');
