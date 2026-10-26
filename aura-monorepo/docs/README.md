# Project Aura / Daily Planner prototype

Project Aura is a South African community-safety and GBV support **prototype** with a disguised Daily Planner frontend, PostgreSQL API, and a separate responder console. It is not a production emergency service and must not be relied on to summon help.

## Components
- `backend-api/`: Express API and PostgreSQL migrations. `server.js` remains the single routes file.
- `frontend-webapp/`: React/Vite citizen interface.
- `responder-console/`: canonical responder UI for the demo; the frontend's `/responder` page is not the canonical console.
- `docs/DEMO_SMS_CHECKLIST.md`: Twilio trial preparation and smoke steps.

## Local setup
1. Copy `.env.example` to `.env` (or configure the API environment) and replace every placeholder. Generate `ID_ENC_KEY` with `openssl rand -hex 32`; use independent random values for `JWT_SECRET`, `ID_HASH_PEPPER`, and `OTP_PEPPER`.
2. Set `DATABASE_URL` to PostgreSQL. For the prototype, `sslmode=require` uses `rejectUnauthorized:false`; this encrypts the connection but does not verify the database certificate chain. Do not treat this as a production TLS configuration. Keep `ALLOWED_ORIGINS` to exact origins: Android uses `https://localhost` with `androidScheme: https`; `capacitor://localhost` is documented for a future iOS shell. Never use `*`.
3. Install dependencies in `backend-api`, `frontend-webapp`, and `responder-console` with `npm ci`. For root Capacitor CLI/Android commands, also run `npm install` at the repository root (the supplied archive has no root lockfile).
4. Run `npm run migrate` in `backend-api`, then `npm run dev` there.
5. Run `npm run dev` in `frontend-webapp` and `responder-console` in separate terminals.
6. With `SMS_PROVIDER=console` in development, OTPs are emitted by the development simulator. With `SMS_PROVIDER=twilio`, configure all three `TWILIO_*` variables. Twilio trial accounts can send only to verified recipient numbers; review `docs/DEMO_SMS_CHECKLIST.md`.

## Auth and responder setup
Signup and sign-in are separate phone + OTP workflows. Responder/admin accounts are promoted by an operator using `UPDATE users SET role='responder' WHERE phone_e164='...';`; the existing role-change trigger bumps `token_version` and invalidates old tokens. Do not promote users based on an unverified request. The responder console signs in using the same login OTP routes.

## Android
The repo contains Capacitor configuration and dependencies, but the generated Android platform and APK have not been verified in this environment. After installing dependencies and configuring the deployed API URL in `frontend-webapp/.env.android`, run `npm run build:android`, then `npx cap open android` and `cd android && ./gradlew assembleDebug`. See `docs/ANDROID_MANIFEST_REQUIREMENTS.md`. Foreground location works only while the app is open; background tracking is not implemented.

## Current verification status
See `CHANGES.md` for command-level PASS/FAIL/NOT RUN results. Live database migration, real Twilio delivery, responder dispatch, emulator loop, and APK build require external services/devices and must not be inferred from static checks.

## Important limits
- Trial SMS only reaches verified numbers.
- Background location is not implemented.
- SA ID checksum validation is not identity proof.
- This is a prototype, not a production emergency service.
