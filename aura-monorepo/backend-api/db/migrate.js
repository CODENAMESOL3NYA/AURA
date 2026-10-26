import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import db from "../src/config/db.js";
const dir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "migrations",
);
try {
  await db.query(
    "CREATE TABLE IF NOT EXISTS schema_migrations(name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())",
  );
  for (const name of (await fs.readdir(dir))
    .filter((n) => n.endsWith(".sql"))
    .sort()) {
    const exists = await db.query(
      "SELECT 1 FROM schema_migrations WHERE name=$1",
      [name],
    );
    if (exists.rowCount) continue;
    const sql = await fs.readFile(path.join(dir, name), "utf8");
    const client = await db.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations(name) VALUES($1)", [
        name,
      ]);
      await client.query("COMMIT");
      console.log(`applied ${name}`);
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }
} finally {
  await db.end();
}
