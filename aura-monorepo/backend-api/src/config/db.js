import pg from "pg";
import { env } from "./env.js";
const { Pool } = pg;
const connectionString = new URL(env.DATABASE_URL);
if (
  env.NODE_ENV === "production" &&
  connectionString.searchParams.get("sslmode") !== "require" &&
  connectionString.searchParams.get("sslmode") !== "verify-full" &&
  env.DATABASE_SSL !== true
)
  throw new Error("DATABASE_URL must require TLS in production");
const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl:
    env.DATABASE_SSL === true || connectionString.searchParams.get("sslmode") === "require"
      ? { rejectUnauthorized: false }
      : undefined,
  max: 10,
  idleTimeoutMillis: 30000,
});
export default pool;
