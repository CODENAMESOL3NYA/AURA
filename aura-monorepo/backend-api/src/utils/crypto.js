import crypto from "node:crypto";
import { env } from "../config/env.js";
export function hashSaId(id) {
  return crypto
    .createHmac("sha256", env.ID_HASH_PEPPER)
    .update(String(id))
    .digest("hex");
}
export function encryptSaId(id) {
  const iv = crypto.randomBytes(12),
    key = Buffer.from(env.ID_ENC_KEY, "hex"),
    cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const body = Buffer.concat([
    cipher.update(String(id), "utf8"),
    cipher.final(),
  ]);
  return Buffer.concat([Buffer.from([1]), iv, cipher.getAuthTag(), body]);
}
export function decryptSaId(input) {
  const b = Buffer.from(input);
  if (b[0] !== 1) throw new Error("Unsupported key version");
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    Buffer.from(env.ID_ENC_KEY, "hex"),
    b.subarray(1, 13),
  );
  decipher.setAuthTag(b.subarray(13, 29));
  return Buffer.concat([
    decipher.update(b.subarray(29)),
    decipher.final(),
  ]).toString("utf8");
}
export function generateOtp() {
  return String(crypto.randomInt(0, 1000000)).padStart(6, "0");
}
export function hashOtp(code, phone) {
  return crypto
    .createHmac("sha256", env.OTP_PEPPER)
    .update(`${phone}:${code}`)
    .digest();
}
export function safeEqual(a, b) {
  const x = Buffer.from(a),
    y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}
