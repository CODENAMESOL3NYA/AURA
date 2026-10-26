# Build guide

The backend needs Node 22, PostgreSQL 13+ (PostgreSQL 16 recommended), and required secrets described in `backend-api/.env.example`. Copy the example to `.env`, replace every placeholder, start Postgres with `docker compose up -d postgres` from `backend-api/`, install dependencies, run `npm run migrate`, then `npm start`. The default console SMS adapter sends no SMS and hides OTP values; interactive registration is blocked until a real provider or safe dev delivery channel is configured.

For the web app, install dependencies in `frontend-webapp/`, set `VITE_API_URL=/api/v1` (Vite proxies this to localhost:5000), and run `npm run dev`. Build with `npm run build`. For the responder console, install dependencies in `responder-console/`, configure `VITE_API_URL` and `VITE_TILE_URL`, and run `npm run build`. These build commands were not verified in the supplied environment because npm dependencies could not be installed.

Native generation requires the platform toolchains and is not included in this zip: see `NATIVE_SETUP.md` for `npx cap add android`, `npx cap add ios`, and `npx cap sync`.
