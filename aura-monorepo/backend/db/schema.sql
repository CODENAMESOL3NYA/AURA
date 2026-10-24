-- Run once: psql "$DATABASE_URL" -f db/schema.sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_role AS ENUM ('citizen', 'responder', 'admin');

CREATE TYPE threat_level AS ENUM ('critical', 'high', 'medium');

CREATE TYPE incident_status AS ENUM ('active', 'acknowledged', 'dispatched', 'resolved', 'cancelled', 'false_alarm');

CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    sa_id_hash text NOT NULL UNIQUE,
    sa_id_enc bytea NOT NULL,
    full_name text NOT NULL,
    phone_e164 text NOT NULL UNIQUE,
    phone_verified_at timestamptz,
    role user_role NOT NULL DEFAULT 'citizen',
    stealth_enabled boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now ()
);

CREATE TABLE otp_codes (
    id bigserial PRIMARY KEY,
    phone_e164 text NOT NULL,
    code_hash text NOT NULL,
    attempts int NOT NULL DEFAULT 0,
    expires_at timestamptz NOT NULL,
    consumed_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now ()
);

CREATE INDEX otp_phone_idx ON otp_codes (phone_e164, created_at DESC);

CREATE TABLE addresses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    street text NOT NULL,
    city text NOT NULL,
    province text NOT NULL,
    latitude double precision,
    longitude double precision,
    is_primary boolean NOT NULL DEFAULT false,
    proof_key text,
    review_state text NOT NULL DEFAULT 'pending' CHECK (
        review_state IN (
            'pending',
            'approved',
            'rejected'
        )
    )
);

CREATE TABLE emergency_contacts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    contact_name text NOT NULL,
    contact_phone text NOT NULL,
    relationship text
);

CREATE TABLE incidents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id uuid NOT NULL REFERENCES users (id),
    category text NOT NULL,
    threat_level threat_level NOT NULL,
    status incident_status NOT NULL DEFAULT 'active',
    is_stealth boolean NOT NULL DEFAULT false,
    latitude double precision NOT NULL CHECK (latitude BETWEEN -90 AND 90),
    longitude double precision NOT NULL CHECK (
        longitude BETWEEN -180 AND 180
    ),
    accuracy_m real,
    environment jsonb NOT NULL DEFAULT '[]',
    note text,
    assigned_unit text,
    eta_minutes int,
    created_at timestamptz NOT NULL DEFAULT now (),
    acknowledged_at timestamptz,
    resolved_at timestamptz
);

CREATE INDEX incidents_open_idx ON incidents (status, created_at DESC);

CREATE UNIQUE INDEX one_open_incident_per_user ON incidents (user_id)
WHERE
    status IN (
        'active',
        'acknowledged',
        'dispatched'
    );

CREATE TABLE incident_locations (
    id bigserial PRIMARY KEY,
    incident_id uuid NOT NULL REFERENCES incidents (id) ON DELETE CASCADE,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    accuracy_m real,
    battery_pct smallint,
    recorded_at timestamptz NOT NULL DEFAULT now ()
);

CREATE INDEX incident_loc_idx ON incident_locations (incident_id, recorded_at DESC);

CREATE TABLE audit_log (
    id bigserial PRIMARY KEY,
    actor_id uuid,
    action text NOT NULL,
    subject_id uuid,
    detail jsonb,
    at timestamptz NOT NULL DEFAULT now ()
);