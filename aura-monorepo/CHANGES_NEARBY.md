# Project Aura — Community Guardian Nearby Alerts

## Delivery summary

The feature code and documentation have been added to the supplied repository in staged commits. **This is not a production-verified release**: dependency installation timed out / the local npm cache lacks the new Capacitor plugin, no PostgreSQL service or credentials were supplied, and no Android/Firebase project exists in the supplied archive. Results below distinguish executed checks from blocked checks.

## Work package status

| Work package | Status | Commit / evidence |
|---|---|---|
| N0 — analysis and baseline | PASS (analysis/commit); runtime baseline NOT RUN | `2f7af58`; `docs/NEARBY_ANALYSIS.md`; original archive had no `.git`, so the baseline commit is newly created locally |
| N1 — migration, retention, env | CODE COMPLETE; DB application NOT RUN | `2bfa3d6`; migration mirror compared byte-for-byte |
| N2 — settings/presence/devices/alerts APIs | CODE COMPLETE; live API tests NOT RUN | `dc610bb`; routes are authenticated, validated, rate-limited, and guarded by the master switch |
| N3 — fan-out and close/retraction hooks | CODE COMPLETE; DB-backed acceptance NOT RUN | `dc610bb`; post-response `finish` hooks; transaction-scoped advisory locks for victim/guardian caps |
| N4 — console and FCM push | CODE COMPLETE; Firebase delivery NOT RUN | `b169614`; console provider logs token prefix and payload keys only |
| N5 — citizen UI/monitor/banner | CODE COMPLETE; Vite build NOT RUN | `d820b6c`; settings card, foreground reporter/poller, neutral stealth banner, dialler links |
| N6 — responder notification count | CODE COMPLETE; console build NOT RUN | `5439352`; additive `guardiansNotified` field |
| N7 — Capacitor/Android push wiring | CODE COMPLETE; native build NOT RUN | `b5fc180`; pinned plugin dependency and setup guide; archive had no `android/` project or Firebase config |
| N8 — tests, seed/e2e scripts, threat model | PARTIAL PASS; integration checks NOT RUN | Pure geospatial/cap unit tests pass; API checks skip without configured URL/tokens; threat model in `docs/NEARBY_THREAT_MODEL.md` |

## Files changed / added

- `backend-api/db/migrations/003_guardian_alerts.sql`
- `backend-api/supabase/migrations/20261026000000_guardian_alerts.sql` (byte-for-byte mirror)
- `backend-api/scripts/purge.sql`
- `backend-api/src/config/env.js`
- `backend-api/src/services/nearby-geo.js`
- `backend-api/src/services/nearby.js`
- `backend-api/src/services/push.js`
- `backend-api/server.js`
- `backend-api/test/nearby.test.js`
- `backend-api/test/nearby.api.test.mjs`
- `backend-api/scripts/seed-guardians.js`
- `backend-api/scripts/e2e-nearby.mjs`
- `frontend-webapp/src/services/apiClient.js`
- `frontend-webapp/src/services/guardian.js`
- `frontend-webapp/src/components/GuardianAlertBanner.jsx`
- `frontend-webapp/src/components/OfficialLayout.jsx`
- `frontend-webapp/src/components/StealthLayout.jsx`
- `frontend-webapp/src/pages/official/SafetySettings.jsx`
- `frontend-webapp/package.json` and `frontend-webapp/package-lock.json`
- root `package.json` (Capacitor plugin discovery)
- `responder-console/src/main.jsx`
- `.env.example`, `backend-api/.env.example`, `.gitignore`
- `docs/NEARBY_ANALYSIS.md`, `docs/NEARBY_THREAT_MODEL.md`, `docs/NEARBY_ANDROID_SETUP.md`
- `CHANGES_NEARBY.md`

## Database migration

- API migration: `backend-api/db/migrations/003_guardian_alerts.sql`
- Supabase mirror: `backend-api/supabase/migrations/20261026000000_guardian_alerts.sql`
- Verified with `cmp -s`: **PASS — identical bytes**.
- The migration adds `guardian_profiles`, `guardian_presence`, `nearby_alerts`, and `device_tokens`, including lookup/retention indexes and a `last_presence_write_at` timestamp for database-backed 30-second throttling. Existing migrations `001` and `002` were not changed.
- `scripts/purge.sql` now purges guardian presence after 24 hours and alerts after 30 days.

## Environment variables

| Variable | Default / use |
|---|---|
| `GUARDIAN_ALERTS_ENABLED` | `false` — master kill switch |
| `GUARDIAN_DEFAULT_RADIUS_M` | `1000` |
| `GUARDIAN_PRESENCE_TTL_MIN` | `30` |
| `GUARDIAN_MAX_RECIPIENTS` | `25` |
| `GUARDIAN_MAX_ALERTS_PER_HOUR` | `3` |
| `VICTIM_MAX_NEARBY_PER_HOUR` | `2` |
| `GUARDIAN_GRID_M` | `250` |
| `PUSH_PROVIDER` | `console` or `fcm` |
| `FCM_PROJECT_ID` | Required when `PUSH_PROVIDER=fcm` |
| `FCM_SERVICE_ACCOUNT_B64` | Base64-encoded service-account JSON; required only for FCM; keep server-side secret |

## Added API routes

All routes are under `/api/v1` and inherit the existing `requireAuth` middleware.

- `GET /guardian/settings`
- `PUT /guardian/settings` — explicit `consent: true` required to enable; opt-out deletes presence and closes the recipient's open alerts
- `POST /guardian/presence` — 30-second per-user write throttle and 200 km/h jump rejection
- `POST /devices` / `DELETE /devices`
- `GET /guardian/alerts` — only the caller's open alerts while guardian opt-in is enabled; exposes only id, creation time, grid-centre area and distance band
- `POST /guardian/alerts/:id/dismiss` — recipient-only; other users receive 404
- `GET /responder/incidents` adds `guardiansNotified`

The SOS and stealth task response bodies were not expanded. Fan-out is attached to response `finish` and errors are swallowed so nearby processing cannot block incident creation. Alert closure is wired to citizen cancel, stealth task done, and responder `resolved` / `false_alarm` paths.

## Validation results

| Check / command | Result | Notes |
|---|---|---|
| `node --check` on changed backend JS/scripts and frontend service JS | PASS | All checked files parsed |
| TypeScript parser syntax check on changed JSX files | PASS | `GuardianAlertBanner.jsx`, both layouts, `SafetySettings.jsx`, responder console |
| JSON parse for root/frontend/backend manifests and frontend lockfile | PASS | All parsed as JSON |
| `node --test backend-api/test/nearby.test.js` | PASS | 4 tests: haversine, grid snapping, distance bands, hourly-cap helper |
| `node --test backend-api/test/nearby.test.js backend-api/test/nearby.api.test.mjs` | PASS with 1 skipped | Four passed; API contract test skipped because no `API_URL` or test tokens |
| `git diff --check` | PASS | No whitespace errors |
| Migration mirror `cmp -s` | PASS | Byte-for-byte identical |
| `npm ci --prefix backend-api` | NOT RUN / blocked | Timed out during dependency install |
| `npm ci --ignore-scripts --offline --prefix frontend-webapp` | NOT RUN / blocked | npm cache has no `@capacitor/push-notifications@7.0.2` tarball |
| `npm --prefix backend-api test` | NOT RUN / blocked | Existing unit test process fails before tests load because `dotenv` is absent; API tests skip without `API_URL` |
| `npm --prefix frontend-webapp run build` | NOT RUN / blocked | `vite: not found` because dependencies are not installed |
| `npm --prefix responder-console run build` | NOT RUN / blocked | `vite: not found` because dependencies are not installed |
| `npm --prefix backend-api run migrate` (twice) | NOT RUN / blocked | `pg` dependency absent; no configured live PostgreSQL database |
| `/health`, OTP/SMS, incident idempotency/cancel, stealth tasks, responder PATCH, full e2e acceptance | NOT RUN | No configured database/API/test accounts; no regression claim is made |
| Android build, FCM token registration/delivery | NOT RUN | No `android/` project, SDK verification, Firebase project or `google-services.json` |

## Local setup, seed, demo and build

1. Install dependencies in an environment with registry access:
   ```sh
   npm install
   npm --prefix backend-api ci
   npm --prefix frontend-webapp ci
   npm --prefix responder-console ci
   ```
2. Configure the backend `.env` with PostgreSQL and existing Aura secrets. Run migration twice to verify idempotence:
   ```sh
   npm --prefix backend-api run migrate
   npm --prefix backend-api run migrate
   ```
3. For a **development/test database only**, set `NODE_ENV=development` or `NODE_ENV=test`, then seed around a test location (Johannesburg example coordinates):
   ```sh
   NODE_ENV=development node backend-api/scripts/seed-guardians.js -26.2041 28.0473
   ```
   The script refuses production or unset `NODE_ENV`. Seeded accounts are test-only; use the database/test harness to obtain authenticated test tokens.
4. Start the API and apps using the project scripts. Set `GUARDIAN_ALERTS_ENABLED=true` only in a development/test environment, opt into Community Guardian from Safety Settings, and trigger a normal SOS or stealth task. Verify a nearby opted-in test account receives a poll alert; verify the push provider with `PUSH_PROVIDER=console` before attempting FCM.
5. Run tests and e2e checks:
   ```sh
   npm --prefix backend-api test
   API_URL=http://localhost:5000 node backend-api/scripts/e2e-nearby.mjs
   ```
   For authenticated API coverage, set `NEARBY_VICTIM_TOKEN`, `NEARBY_GUARDIAN_TOKEN`, and optionally `NEARBY_OTHER_TOKEN` / `NEARBY_FOREIGN_ALERT_ID` from test fixtures.
6. Android/Firebase steps are documented in `docs/NEARBY_ANDROID_SETUP.md`. Do not commit `google-services.json` or service-account credentials.

## Security/privacy review and remaining risks (ranked)

1. **High — prototype must not be treated as production-ready.** Threat-model and privacy/legal review under POPIA, operational monitoring, real-device validation, and end-to-end regression are still required.
2. **High — repeated location probing.** Grid-centre coordinates and distance bands still reveal approximate location; multiple verified accounts or repeated observations can reduce privacy. Caps reduce but do not eliminate this risk.
3. **High — deployment validation absent.** PostgreSQL migration, FCM HTTP v1 auth/delivery, Android notification permission and push tap behavior have not been exercised in this environment.
4. **Medium — foreground-only coverage.** Guardians must have used/opened the app recently; background location is not implemented and no background tracking is claimed.
5. **Medium — push token lifecycle.** Tokens are removed when FCM reports an unregistered token; production should add explicit token revocation on logout/device removal and secret-manager/IAM controls.
6. **Medium — rate-limit operations.** The sensitive per-user presence throttle and hourly fan-out caps use database locks, but concurrent-load tests and lock-contention monitoring remain necessary.
7. **Medium — sparse participation / false SOS.** Low local density can mean no guardian receives an alert; false SOS still requires the existing responder/incident lifecycle to resolve it.

## Git history (`git log --oneline`)

```text
7f572eb Honor configured guardian grid size during fan-out
045825e Fix alert closure for previously dismissed notices
557358e Finalize nearby delivery report and commit history
e0375d4 N8 add nearby tests, development seeding and threat model
b5fc180 N7 wire Capacitor Android push dependency and setup guidance
5439352 N6 show guardian notification counts in responder console
d820b6c N5 add guardian settings, foreground monitoring and alert banners
b169614 N4 add console and Firebase Cloud Messaging providers
dc610bb N2-N3 add authenticated guardian APIs and isolated fan-out
2bfa3d6 N1 add guardian alert schema, retention and configuration
2f7af58 N0 analysis: document architecture and safe insertion points
87e2775 N0 baseline: untouched supplied repository
```

The repository was initialized locally because the uploaded archive contained no `.git` metadata. A final report-only commit may appear above these implementation commits in the delivered archive.

## Limits to communicate in the pitch

- Presence is foreground-only; guardians not seen in the last 30 minutes are not alerted.
- This does not replace SAPS or emergency services.
- Privacy controls reduce, but do not eliminate, abuse risk.
- This feature does not use trial SMS; it uses in-app polling and optional Android FCM push.
