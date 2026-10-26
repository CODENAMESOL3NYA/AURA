CREATE TABLE IF NOT EXISTS guardian_profiles (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT false,
  radius_m integer NOT NULL DEFAULT 1000 CHECK (radius_m BETWEEN 500 AND 2000),
  consented_at timestamptz,
  last_presence_write_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS guardian_presence (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  lat double precision NOT NULL CHECK (lat BETWEEN -90 AND 90),
  lng double precision NOT NULL CHECK (lng BETWEEN -180 AND 180),
  accuracy double precision NOT NULL CHECK (accuracy >= 0),
  seen_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS guardian_presence_seen_idx ON guardian_presence(seen_at);
CREATE INDEX IF NOT EXISTS guardian_presence_lat_lng_idx ON guardian_presence(lat,lng);
CREATE TABLE IF NOT EXISTS nearby_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  recipient_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  area_lat double precision NOT NULL,
  area_lng double precision NOT NULL,
  distance_band text NOT NULL CHECK (distance_band IN ('under 500 m','500 m to 1 km','1 to 2 km')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','dismissed','closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  delivered_at timestamptz,
  dismissed_at timestamptz,
  UNIQUE(incident_id,recipient_user_id)
);
CREATE INDEX IF NOT EXISTS nearby_alerts_recipient_status_idx ON nearby_alerts(recipient_user_id,status);
CREATE INDEX IF NOT EXISTS nearby_alerts_created_idx ON nearby_alerts(created_at);
CREATE TABLE IF NOT EXISTS device_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  platform text NOT NULL CHECK (platform IN ('android','ios','web')),
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now()
);
