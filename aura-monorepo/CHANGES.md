# Project Aura completion handoff

## Summary

This pass implements substantial code changes for OTP signup/login, OTP send caps, responder sign-in, stealth task location pings, latest-location reporting, Twilio failure handling, dev proxy correction, and supporting documentation/smoke scripts. It is **not an end-to-end verified release**: dependency installation failed or timed out in this environment, and no live PostgreSQL credentials, Twilio account, or Android SDK/emulator were available. Do not describe unrun workflows as tested.

## Work packages

| Work package | Status | Changes / verification |
|---|---|---|
| WP0 — Baseline and safety net | PARTIAL | Created Git baseline `c3286cd`. Updated root/API `.env.example` with a valid-format 64-hex `ID_ENC_KEY` placeholder, Twilio variables, origins, and `NOTIFY_CONTACTS_ON_CREATE`. Existing `001_init.sql` was not edited. `npm ci` did not complete: backend npm reported “Exit handler never called”; frontend install timed out; responder install/build dependencies are unavailable. Live migration no-op was NOT RUN. |
| WP1 — Signup/login and OTP limits | PARTIAL | Added login request/verify and resend routes; phone-level 3-sends/10-min cap, invalidation of old codes, 5-attempt lockout, and verified-user login behavior in `backend-api/server.js`; added `002_otp_limits.sql` and timestamped mirror; added frontend sign-in/create-account toggle and API methods. Static Node syntax checks PASS. Database-backed route tests NOT RUN. |
| WP2 — Responder sign-in | PARTIAL | Responder console now calls login OTP routes and no longer attempts fake registration with an empty ID. Role check retained. Console build NOT RUN because `vite` is unavailable. |
| WP3 — Stealth live location | PARTIAL | Added owner-checked `POST /tasks/:id/location`; stealth dispatch pings the task route; responder list uses a lateral join for latest location and age. Static server syntax PASS; database/API exercise NOT RUN. |
| WP4 — Twilio reliability | PARTIAL | Twilio non-2xx responses now fail, logs include only provider code/status, known trial/invalid-recipient errors are classified, contact notification attempts are audited per contact, optional notify-on-create flag added, and hard-coded contact-SMS fallback coordinates removed. Added `docs/DEMO_SMS_CHECKLIST.md`. Real Twilio delivery/failure verification NOT RUN. |
| WP5 — Dev/prod wiring and docs | PARTIAL | Vite proxy target changed to `http://127.0.0.1:5000`; README, TASKS, remediation report updated. Proxy request, live health and migration behavior NOT RUN. |
| WP6 — Android / Capacitor | PARTIAL | Added `.env.android` with a placeholder HTTPS API URL, build commands, and manifest requirements documentation. Root Capacitor dependencies already existed in `package.json`; no Android platform or APK was generated because dependencies/SDK were unavailable. `npx cap sync android`, emulator flow and APK build are NOT RUN. |
| WP7 — Minimal smoke checks | PARTIAL | Extended `test/api.security.test.mjs` with optional checks for role authorization, account-enumeration response equality, OTP cap, incident idempotency and cross-user access. Added interactive `backend-api/scripts/e2e-smoke.mjs`. Script syntax PASS; test execution requiring installed packages/API/seed data NOT RUN. |

## Regression checklist

| Check | Result | Evidence / limitation |
|---|---|---|
| `npm run migrate` is a no-op on the live DB | NOT RUN | No live DB credentials were supplied. Migration idempotency cannot be claimed from static inspection. |
| `db/migrations` and `supabase/migrations` match | PASS | `cmp` passed for `001_init.sql` and its existing timestamped mirror, and for `002_otp_limits.sql` and `20261025120000_otp_limits.sql`. |
| `GET /api/v1/health` returns `db: up` | NOT RUN | No running API/live database in this environment. |
| Real OTP SMS reaches a verified number, unchanged text | NOT RUN | Requires Twilio credentials and a verified recipient. Existing OTP SMS wording was not intentionally changed. |
| Existing register → verify flow | NOT RUN | Requires dependencies, PostgreSQL and SMS provider. |
| Incident create/idempotency/location/cancel, responder PATCH, profile CRUD shapes | NOT RUN | Requires running seeded API/database. |
| Citizen incident response contains only `id,status,unit,etaMinutes,createdAt` | NOT RUN | No runtime API test was possible; the citizen `view()` shape was left unchanged. |
| Stealth paths avoid emergency vocabulary | NOT RUN | No automated grep assertion was added for this item; review is still required. |
| `npm test` | FAIL (environment) | Ran in `backend-api`; tests could not load because `backend-api/node_modules/dotenv/config` was missing. API integration test was skipped without `API_URL`. |
| Frontend build | FAIL (environment) | `npm run build` reports `vite: not found` after dependency install timed out. |
| Responder console build | NOT RUN / unavailable | `vite` is not installed; the build command likewise cannot run in this environment. |
| Static JS syntax checks | PASS | `node --check` passed for `server.js`, `env.js`, SMS/notify modules, test and smoke scripts, `apiClient.js`, and `dispatchService.js`. |
| Diff whitespace check | PASS | `git diff --check` passed before the implementation commit. |

## End-to-end acceptance

All steps below are **NOT RUN** against a real stack: signup and SMS verification; contact/address setup; logout-all and login; normal and stealth alert/location pings; responder OTP, latest-location display, acknowledge/dispatch; contact SMS and citizen tracker polling; cancel/resolve, one-open-incident behavior and audit rows; Android emulator/device flow. `backend-api/scripts/e2e-smoke.mjs` is provided for the API portion. The manual SMS preflight is in `docs/DEMO_SMS_CHECKLIST.md`.

## Environment variables and migrations

- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`: optional when `SMS_PROVIDER=console`, required when `SMS_PROVIDER=twilio`.
- `NOTIFY_CONTACTS_ON_CREATE=false`: default preserves dispatch-only contact notifications; set to `true` to also attempt notifications on new incident/task creation.
- `ALLOWED_ORIGINS`: exact allow-list; Android uses `https://localhost`; `capacitor://localhost` is documented for a future iOS shell. Do not use `*`.
- New migration: `backend-api/db/migrations/002_otp_limits.sql`, mirrored byte-for-byte as `backend-api/supabase/migrations/20261025120000_otp_limits.sql`.
- `frontend-webapp/.env.android`: placeholder `VITE_API_URL=https://api.example.org/api/v1`; replace it before native build.
- No real credentials or `.env` files are included.

## Commands

### Local API and web demo

```bash
# Install dependencies (network access is required)
cd backend-api && npm ci
cd ../frontend-webapp && npm ci
cd ../responder-console && npm ci

# Configure environment and start the API
cd ../backend-api
cp .env.example .env   # then replace placeholders; do not commit .env
npm run migrate
npm run dev

# In separate terminals, from the repo root:
npm --prefix frontend-webapp run dev
npm --prefix responder-console run dev
```

### Smoke script

Set `API_URL`, `SMOKE_FULL_NAME`, `SMOKE_SA_ID`, `SMOKE_PHONE`, and `SMOKE_RESPONDER_PHONE`. The phone must be verified for Twilio trial delivery, and the responder phone must belong to a promoted responder/admin account. In console mode, follow the configured local test OTP procedure.

```bash
cd backend-api
npm run smoke:e2e
```

### Android

```bash
# Install root Capacitor dependencies; the supplied repo archive has no root lockfile.
npm install
# Replace the placeholder URL in frontend-webapp/.env.android first.
npm run build:android
npx cap sync android
npx cap open android
cd android
./gradlew assembleDebug
```

The Android platform is not included/generated in this handoff; these commands are instructions, not a claim that an APK was built. See `docs/ANDROID_MANIFEST_REQUIREMENTS.md`.

## Remaining risks (ranked)

1. **Critical — no end-to-end run:** dependencies did not install, and no database/API/Twilio/emulator test ran. Do not deploy or use for real emergencies.
2. **High — OTP behavior needs integration validation:** verify concurrency, send cap windows, wrong-code lockout, rollback/retry behavior, and neutral replies against PostgreSQL.
3. **High — Twilio trial limits:** delivery is restricted to verified numbers; verify actual error codes, contact audit rows and message delivery before demo.
4. **High — native shell incomplete:** Android platform/manifest merge/secure-storage plugin compatibility/APK build are unverified. Background location is not implemented.
5. **High — database TLS trade-off:** `sslmode=require` still uses `rejectUnauthorized:false`; certificate verification is disabled for this prototype.
6. **Medium — identity proof:** SA ID checksum validation is not identity proof.
7. **Medium — security smoke coverage:** optional tests require carefully seeded users and clean OTP windows; the full test script must be run in CI/staging.

## Git history

`git log --oneline` at handoff creation:

```text
dce2d80 complete Aura OTP, location, SMS and native wiring
c3286cd baseline: untouched Aura remediation v2 tree
```

## Mandatory limits

- Twilio trial SMS only reaches verified numbers.
- Background location is not implemented.
- SA ID checksum validation is not identity proof.
- This is a prototype, not a production emergency service.
