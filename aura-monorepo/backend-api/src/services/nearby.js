import db from '../config/db.js';
import { env } from '../config/env.js';
import { sendNotice } from './push.js';

export { haversineMeters, snapToGrid, distanceBand, isUnderCap } from './nearby-geo.js';
import { haversineMeters, snapToGrid, distanceBand, isUnderCap } from './nearby-geo.js';

export async function fanOut(incident) {
  if (!env.GUARDIAN_ALERTS_ENABLED || !incident?.id) return 0;
  const client = await db.connect();
  const inserted = [];
  try {
    await client.query('BEGIN');
    // Serialize a victim's cap and each guardian's cap across concurrent requests/processes.
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`victim-nearby:${incident.user_id}`]);
    const victimCount = await client.query(`SELECT count(DISTINCT a.incident_id)::int AS n FROM nearby_alerts a JOIN incidents i ON i.id=a.incident_id WHERE i.user_id=$1 AND a.created_at > now()-interval '1 hour'`, [incident.user_id]);
    if (!isUnderCap(victimCount.rows[0].n, env.VICTIM_MAX_NEARBY_PER_HOUR)) { await client.query('COMMIT'); return 0; }

    const radius = 2000;
    const latDelta = radius / 111320;
    const lngDelta = radius / (111320 * Math.max(0.01, Math.cos(incident.lat * Math.PI / 180)));
    const candidates = await client.query(`SELECT gp.user_id,gp.lat,gp.lng,gp.seen_at,p.radius_m FROM guardian_presence gp JOIN guardian_profiles p ON p.user_id=gp.user_id JOIN users u ON u.id=gp.user_id WHERE p.enabled=true AND u.phone_verified_at IS NOT NULL AND gp.user_id<>$1 AND gp.seen_at > now()-($2::text || ' minutes')::interval AND gp.lat BETWEEN $3 AND $4 AND gp.lng BETWEEN $5 AND $6`, [incident.user_id, env.GUARDIAN_PRESENCE_TTL_MIN, Math.max(-90, incident.lat-latDelta), Math.min(90, incident.lat+latDelta), Math.max(-180, incident.lng-lngDelta), Math.min(180, incident.lng+lngDelta)]);
    const eligible = [];
    for (const guardian of candidates.rows) {
      const distance = haversineMeters(incident.lat, incident.lng, guardian.lat, guardian.lng);
      if (distance <= Math.min(2000, guardian.radius_m)) eligible.push({ userId: guardian.user_id, distance });
    }
    // Stable lock order avoids deadlocks when two incidents share guardians.
    eligible.sort((a, b) => String(a.userId).localeCompare(String(b.userId)));
    const underCap = [];
    for (const guardian of eligible) {
      await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`guardian-alert:${guardian.userId}`]);
      const cap = await client.query(`SELECT count(*)::int AS n FROM nearby_alerts WHERE recipient_user_id=$1 AND created_at > now()-interval '1 hour'`, [guardian.userId]);
      if (isUnderCap(cap.rows[0].n, env.GUARDIAN_MAX_ALERTS_PER_HOUR)) underCap.push(guardian);
    }
    underCap.sort((a, b) => a.distance - b.distance);
    const selected = underCap.slice(0, env.GUARDIAN_MAX_RECIPIENTS);
    const area = snapToGrid(incident.lat, incident.lng, env.GUARDIAN_GRID_M);
    for (const guardian of selected) {
      const q = await client.query(`INSERT INTO nearby_alerts(incident_id,recipient_user_id,area_lat,area_lng,distance_band) VALUES($1,$2,$3,$4,$5) ON CONFLICT(incident_id,recipient_user_id) DO NOTHING RETURNING recipient_user_id`, [incident.id, guardian.userId, area.areaLat, area.areaLng, distanceBand(guardian.distance)]);
      if (q.rowCount) inserted.push(guardian.userId);
    }
    if (inserted.length) await client.query(`INSERT INTO audit_log(actor_user_id,incident_id,action,details) VALUES($1,$2,'nearby_alerts_created',$3::jsonb)`, [null, incident.id, JSON.stringify({ incidentId: incident.id, recipientCount: inserted.length })]);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally { client.release(); }
  for (const userId of inserted) void sendNotice(userId).catch(() => {});
  return inserted.length;
}

export async function closeIncidentAlerts(incidentId) {
  await db.query("UPDATE nearby_alerts SET status='closed' WHERE incident_id=$1 AND status<>'closed'", [incidentId]);
}
