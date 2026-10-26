# Project Aura — Nearby Alerts Repository Analysis (N0)

## Scope and provenance

Analysis of the supplied `Aura_Remediation_v2-main` archive before feature changes. The archive did not contain `.git`; a local Git repository was initialized and the untouched supplied tree committed as `87e2775` (`N0 baseline: untouched supplied repository`). This is a provenance baseline, not the upstream repository's original history.

## Current architecture

- **API:** `backend-api/server.js`, Express 4, ESM. Global Helmet/CORS/JSON/rate-limit middleware is registered first; `requireAuth` is mounted globally at `/api/v1` after public auth routes and health endpoint. All subsequent routes inherit authentication. `requireRole` protects responder routes. Zod request schemas use `.strip()`.
- **Persistence:** PostgreSQL through `pg` in `backend-api/src/config/db.js`; migration runner `backend-api/db/migrate.js` applies sorted SQL files recorded in `schema_migrations`. Current API migrations are `001_init.sql` and `002_otp_limits.sql`. Supabase mirrors use timestamped names, not the same filenames. `001_init.sql` defines `incidents`, the one-open-incident partial unique index, `incident_locations`, `audit_log`, `tasks`, users, and contact data.
- **Incident creation:** `createIncident()` in `server.js` returns `{row, created}` and inserts incident/location rows; the existing POST `/incidents` responds with `{success, incident: {id,status,unit,etaMinutes,createdAt}}`. POST `/tasks` also calls `createIncident`, then creates/returns a task. Existing contact notification is fire-and-forget only after creation.
- **Close paths:** citizen cancel (`POST /incidents/:id/cancel`), stealth task completion (`POST /tasks/:id/done`), and responder status update (`PATCH /responder/incidents/:id`, status `resolved`/`false_alarm`). These are the integration points for closing nearby alerts.
- **Frontend:** React 19/Vite/Capacitor app in `frontend-webapp`; `apiClient.js` centralizes authenticated fetches; `location.js` exposes `getFix`; `SafetySettings.jsx` is a local-state settings screen today; `OfficialLayout.jsx` and `StealthLayout.jsx` are the shared shells; `QuickExitZone` wraps the stealth header. Responder UI is a separate Vite app under `responder-console`.
- **Native:** `capacitor.config.ts` exists. No `android/` directory is present in the archive. Firebase project configuration and `google-services.json` are absent.

## Safe insertion points

1. Add a new idempotent migration after current API migration `002` (`003_guardian_alerts.sql`) and a timestamped Supabase mirror. Never edit migrations `001` or `002`.
2. Add guardian routes in `server.js` after the global `/api/v1` `requireAuth` mount, each with route-level rate limiting and stripped Zod schemas. Existing auth middleware populates `req.user` with `id`, `phone_verified_at`, and role; require verified phone before enabling guardian mode.
3. Add `src/services/nearby.js` for pure geospatial helpers, bounded candidate lookup, caps, insertion, audit, and closure; add `src/services/push.js` for provider abstraction. Preserve the existing response shapes and call fan-out only after sending the HTTP response, guarded by a detached try/catch.
4. In `POST /incidents` and `POST /tasks`, capture only newly created incidents and schedule fan-out after response completion. Add closure calls after successful status updates on all three close paths. Responder count should be an additive field computed from alert rows, without exposing recipient identity.
5. Add API methods to `frontend-webapp/src/services/apiClient.js`, a foreground-only `services/guardian.js`, a standalone banner in both shared layouts, and a new card in `SafetySettings.jsx`. Keep quick exit above/available over the banner; use neutral copy in stealth mode.
6. Extend only the incident row rendering in `responder-console/src/main.jsx` to show `guardiansNotified`.

## Existing contracts to preserve

- Existing route paths and response fields, especially the citizen incident view.
- Idempotent incident creation and partial unique index `one_open_incident_per_user`.
- OTP and contact SMS implementations, wording and function signatures.
- Global/auth rate limits, CORS allow-list, neutral authentication responses.
- Stealth disguise and quick-exit behavior.
- No edits to applied migrations; no third-party frontend scripts; no wildcard CORS.
- SOS response must not wait on nearby fan-out; guardian errors must not change SOS success.

## Specification conflicts / implementation cautions found

- **Migration names differ:** API uses numeric filenames, Supabase uses timestamped names. Use `003_guardian_alerts.sql` for the API and a new timestamped Supabase mirror; byte-for-byte mirror requirement conflicts with differing filenames only, not content.
- **No Git metadata in archive:** original commit history cannot be reported; the local baseline commit is newly created.
- **Stealth vocabulary assertion conflicts with current code:** `DiscreetJournal.jsx` includes “In an actual emergency, dial 10111…” and `StealthDashboard.jsx` uses emergency-oriented variable names and UI. The feature must not add emergency vocabulary to stealth banners, but deleting existing text would alter current behavior and was not done as part of N0.
- **“Only coarse position stored for 24 h” needs careful wording:** server stores rounded guardian presence, purges stale presence after 24 h; incident coordinates are already stored in existing incident tables and must not be confused with guardian-presence retention.
- **Distance privacy is not absolute:** even blurred cells and bands can leak approximate location when alerts are observed repeatedly. The caps reduce but do not eliminate multi-account probing.
- **Push implementation:** FCM requires credentials/project configuration not present in the archive. It can be implemented/configured but cannot be validated against Firebase here.
- **Rate limiting:** global limit exists, but new endpoints need specific per-user rate controls; in-memory counters alone are not robust across multiple API processes. Database-backed constraints or transactions are preferable for sensitive caps.

## Baseline execution results

The archive has package manifests and lockfiles but no installed `node_modules`. `npm ci --prefix backend-api` was attempted and timed out before completion in this environment. No database credentials/service were supplied, so live migration, `/health`, and end-to-end API checks cannot be performed without a configured database.

| Check | Baseline result | Evidence / reason |
|---|---|---|
| Untouched baseline commit | PASS | Local commit `87e2775` created before any source changes |
| Backend dependency install | NOT RUN | `npm ci --prefix backend-api` timed out |
| Backend unit/API tests | NOT RUN | Dependencies not installed; no test DB configured |
| Frontend build | NOT RUN | Dependencies not installed |
| Responder console build | NOT RUN | Dependencies not installed |
| Migration / DB health / E2E | NOT RUN | No live PostgreSQL configuration supplied |
| Android build / FCM | NOT RUN | No Android project/SDK or Firebase project credentials in archive |
