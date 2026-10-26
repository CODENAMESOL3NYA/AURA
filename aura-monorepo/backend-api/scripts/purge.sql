-- Run under a restricted maintenance role. Keep audit_log for incident accountability.
DELETE FROM otp_codes WHERE created_at < now() - interval '1 day';
DELETE FROM incident_locations il USING incidents i WHERE il.incident_id=i.id AND i.status IN ('resolved','cancelled','false_alarm') AND i.closed_at < now() - make_interval(days => COALESCE(NULLIF(current_setting('app.retention_days_locations', true), '')::int, 90));
DELETE FROM guardian_presence WHERE seen_at < now() - interval '24 hours';
DELETE FROM nearby_alerts WHERE created_at < now() - interval '30 days';
