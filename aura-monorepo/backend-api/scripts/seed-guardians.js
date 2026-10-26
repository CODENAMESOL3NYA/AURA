import 'dotenv/config';
import db from '../src/config/db.js';
import { hashSaId, encryptSaId } from '../src/utils/crypto.js';

const env = process.env.NODE_ENV;
if (!['development', 'test'].includes(env)) {
  console.error('Refusing to seed guardians unless NODE_ENV=development or test.');
  process.exit(1);
}
const lat = Number(process.argv[2]), lng = Number(process.argv[3]);
if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) {
  console.error('Usage: NODE_ENV=development node scripts/seed-guardians.js <latitude> <longitude>');
  process.exit(2);
}
const randDigits = (n) => Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join('');
const points = [
  { name: 'Demo Guardian A', dlat: 0.0045, dlng: 0, radius: 1000 },
  { name: 'Demo Guardian B', dlat: 0, dlng: 0.0135, radius: 1000 },
  { name: 'Demo Guardian C', dlat: -0.009, dlng: 0, radius: 2000 },
  { name: 'Demo Guardian Far', dlat: 0.05, dlng: 0.05, radius: 2000 },
];
try {
  for (let i = 0; i < points.length; i++) {
    const point = points[i], idNumber = randDigits(13), phone = `+2782${randDigits(7)}`;
    const user = await db.query(`INSERT INTO users(sa_id_hash,sa_id_enc,full_name,phone_e164,phone_verified_at) VALUES($1,$2,$3,$4,now()) RETURNING id`, [hashSaId(idNumber), encryptSaId(idNumber), point.name, phone]);
    const userId = user.rows[0].id;
    await db.query('INSERT INTO guardian_profiles(user_id,enabled,radius_m,consented_at) VALUES($1,true,$2,now())', [userId, point.radius]);
    await db.query('INSERT INTO guardian_presence(user_id,lat,lng,accuracy,seen_at) VALUES($1,$2,$3,25,now())', [userId, Number((lat + point.dlat).toFixed(3)), Number((lng + point.dlng).toFixed(3))]);
    console.log(`Seeded ${point.name}: ${userId}`);
  }
  console.log('Created 3 nearby guardian demo accounts and 1 far-away account. IDs are for development/test use only.');
} finally { await db.end(); }
