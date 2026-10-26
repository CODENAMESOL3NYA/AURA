import db from "../src/config/db.js";
import { hashSaId, encryptSaId } from "../src/utils/crypto.js";
import { signToken } from "../src/middleware/auth.js";
if (!["development", "test"].includes(process.env.NODE_ENV)) {
  console.error("Seed script is dev/test only");
  process.exit(1);
}
const citizens = [
  { id: "8001015009087", name: "Test Citizen One", phone: "+27820000001" },
  { id: "8001015009088", name: "Test Citizen Two", phone: "+27820000002" },
];
try {
  const users = [];
  for (const u of [
    ...citizens,
    {
      id: "8001015009089",
      name: "Test Responder",
      phone: "+27820000003",
      role: "responder",
    },
  ]) {
    const r = await db.query(
      "INSERT INTO users(sa_id_hash,sa_id_enc,full_name,phone_e164,phone_verified_at,role) VALUES($1,$2,$3,$4,now(),$5) ON CONFLICT(phone_e164) DO UPDATE SET full_name=EXCLUDED.full_name RETURNING id,role,token_version",
      [hashSaId(u.id), encryptSaId(u.id), u.name, u.phone, u.role || "citizen"],
    );
    users.push({ user: r.rows[0], token: signToken(r.rows[0]) });
  }
  for (const x of users)
    console.log(
      JSON.stringify({ id: x.user.id, role: x.user.role, token: x.token }),
    );
} finally {
  await db.end();
}
