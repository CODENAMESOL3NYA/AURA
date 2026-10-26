# Project Aura API

Node 22 / Express 4 / PostgreSQL 16 prototype. Configure every required secret from `.env.example`; never commit `.env`. Neither the console nor Twilio SMS adapter is implemented. New registrations return 503 before an account is created; no OTP or contact SMS is sent.

## Local setup
1. `cp .env.example .env` (use `backend-api/.env.example` in this directory); replace every dummy secret.
2. `docker compose up -d postgres`
3. `npm install` (generates a local lockfile; this delivered archive does not contain one yet)
4. `npm run migrate`
5. `npm start`
6. `npm test`

Production requires `DATABASE_URL` with TLS (`sslmode=require` or `verify-full`), a real SMS provider, HTTPS, and a narrowly scoped `ALLOWED_ORIGINS`. To promote a user, run `UPDATE users SET role='responder' WHERE phone_e164='+27XXXXXXXXX';` using a privileged database session. A database trigger increments `token_version` on role changes, invalidating existing tokens.

The `scripts/purge.sql` retention statements are maintenance SQL and should be scheduled with `app.retention_days_locations` set to `RETENTION_DAYS_LOCATIONS`. Open incidents are protected by a partial unique index. This is a prototype, not a production emergency response service until the remaining gaps in the remediation report are resolved.
