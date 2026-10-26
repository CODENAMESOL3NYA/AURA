import db from '../config/db.js';
import { sendContactSms } from './sms.js';

/** Best-effort contact delivery. Per-contact failures are audited without PII. */
export async function notifyContacts(userId, incident) {
  const results = [];
  try {
    const u = await db.query('SELECT full_name FROM users WHERE id=$1', [userId]);
    const contacts = await db.query('SELECT id, phone_e164 FROM emergency_contacts WHERE user_id=$1', [userId]);
    for (const contact of contacts.rows) {
      try {
        const result = await sendContactSms(contact.phone_e164, u.rows[0]?.full_name || 'A contact', incident.lat, incident.lng);
        results.push({ contactId: contact.id, success: true, provider: result?.provider || 'unknown' });
        await db.query("INSERT INTO audit_log(actor_user_id,incident_id,action,details) VALUES($1,$2,'contact_sms_sent',$3::jsonb)", [userId, incident.id || null, JSON.stringify({ contact_id: contact.id })]);
      } catch (error) {
        const code = Number.isFinite(Number(error?.code)) ? Number(error.code) : null;
        results.push({ contactId: contact.id, success: false, errorCode: code });
        await db.query("INSERT INTO audit_log(actor_user_id,incident_id,action,details) VALUES($1,$2,'contact_sms_failed',$3::jsonb)", [userId, incident.id || null, JSON.stringify({ contact_id: contact.id, error_code: code })]).catch(() => {});
      }
    }
  } catch (error) {
    console.warn('[CONTACT NOTIFICATION ERROR]', error?.name || 'Error');
  }
  return results;
}
