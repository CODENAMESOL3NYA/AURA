ALTER TABLE otp_codes ADD COLUMN IF NOT EXISTS sends_count integer NOT NULL DEFAULT 1;
ALTER TABLE otp_codes ADD COLUMN IF NOT EXISTS sends_window_start timestamptz NOT NULL DEFAULT now();
CREATE INDEX IF NOT EXISTS otp_phone_window_idx ON otp_codes(phone_e164, sends_window_start DESC);
