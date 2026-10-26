import db from "../src/config/db.js";
import { env } from "../src/config/env.js";
import { hashSaId, encryptSaId } from "../src/utils/crypto.js";
import { toE164 } from "../src/utils/phone.js";

if (env.NODE_ENV === "production") throw new Error("Refusing to seed in production");

const phone = toE164(process.env.SEED_PHONE);
const idNumber = process.env.SEED_ID_NUMBER; // a valid 13-digit SA ID
if (!phone || !idNumber) throw new Error("Set SEED_PHONE and SEED_ID_NUMBER");

await db.query(
  `INSERT INTO users(sa_id_hash,sa_id_enc,full_name,phone_e164,role,phone_verified_at)
   VALUES($1,$2,'Default Responder',$3,'responder',now())
   ON CONFLICT DO NOTHING`,
  [hashSaId(idNumber), encryptSaId(idNumber), phone],
);
await db.end?.();