# Security traceability (implementation status)

| Requirement | Implementation / review | Status |
|---|---|---|
| SR-01 | `server.js` `/auth/verify-otp` gates token issuance | Partial: SMS delivery unavailable; full flow not testable |
| SR-02 | `src/utils/crypto.js`, OTP handling in `server.js` | Partial: HMAC + CSPRNG + expiry + attempt cap; per-phone 3-send/10m cap missing |
| SR-03 | `src/middleware/auth.js`, frontend `services/storage.js`, `NATIVE_SETUP.md` | Partial: HS256/issuer/expiry and native plugin call; native plugin/platform build unverified; no Android manifest generated |
| SR-04 | `server.js`, `src/middleware/auth.js` | Partial: protected routes and responder role checks; health and auth register/verify are public |
| SR-05 | owner-scoped SQL in `server.js` incident/task routes | Partial: ownership checks in SQL for incident/task reads/cancel/pings |
| SR-06 | `src/utils/crypto.js`, users migration | Implemented in code; database-backed test not run |
| SR-07 | `src/config/db.js`, `NATIVE_SETUP.md` | Partial: production TLS enforcement; API HTTPS deployment not provided |
| SR-08 | `src/config/env.js`, `.env.example` | Implemented in code; boot-failure test not run |
| SR-09 | incident response projection, `scripts/purge.sql` | Partial: citizen incident projection minimal; retention job requires scheduling/configuration |
| SR-10 | `src/services/sms.js`, `server.js` | Partial: no ID/coordinate/token logging; console adapter redacts OTP and phone, real SMS absent |
| SR-11 | Zod schemas in `server.js`, 100 KB parser | Partial: major write routes validated; all request bodies/routes not yet independently audited |
| SR-12 | parameterized `pg` calls in `server.js` | Implemented in current routes; static review recommended |
| SR-13 | exact `ALLOWED_ORIGINS`, rate-limit middleware in `server.js` | Partial: exact allowlist/global/auth limit; per-phone OTP cap missing |
| SR-14 | `src/middleware/error.js`, final handler | Partial: generic server errors; parser/CORS paths require live tests |
| SR-15 | `src/services/location.js`, `dispatchService.js` | Partial: GPS helper has no fallback coordinates; official screens still contain legacy simulated paths |
| SR-16 | migration partial unique index; `createIncident` | Implemented in API code; race behaviour not database-tested |
| SR-17 | audit writes in cancellation/responder/task completion | Partial: responder and citizen cancel paths write audit; other transitions require tests |
| SR-18 | `utils/quickExit.js`, `QuickExitZone.jsx` | Partial: no global click/Escape listener; shake logic is duplicated between context and utility; native behaviour unverified and stealth dashboard still needs final UI review |
| SR-19 | `StealthTrigger.jsx`, `StealthDashboard.jsx`, `dispatchService.js` | Partial: numeric task contract used in edited flows; legacy stealth strings remain in some source text and need a full audit |
| SR-20 | `DiscreetJournal.jsx`, `README.md` | Partial: some false chat claims removed; full user-reachable copy review remains |
| DF-01 | `src/middleware/auth.js` pins `algorithms: ['HS256']` | Implemented in code |
| DF-02 | `users.token_version`, JWT claim, DB reread in `src/middleware/auth.js` | Partial: version is re-read; API test for immediate invalidation not run |
| DF-03 | Registration conflict branch in `server.js` | Partial: uniform 202 and hash-prefix audit row; no concurrency test |
| DF-04 | No distinct DF-04 criterion is enumerated in the supplied design-review list | Not independently assessable from the supplied criteria |
| DF-05 | No distinct DF-05 criterion is enumerated in the supplied design-review list | Not independently assessable from the supplied criteria |
| DF-06 | `server.js` location ping handler | Implemented in code; not integration-tested |
| DF-07 | `/tasks` numeric schema and server-side mapping | Partial: numeric facade implemented; stealth path needs full source audit |
| DF-08 | No distinct DF-08 criterion is enumerated in the supplied design-review list | Not independently assessable from the supplied criteria |
| DF-09 | key-version prefix in `src/utils/crypto.js` | Implemented in code; no key rotation beyond version 1 |
| DF-10 | `POST /auth/logout-all` and role-change trigger | Partial: logout-all implemented in code; role-change and logout invalidation not tested |
