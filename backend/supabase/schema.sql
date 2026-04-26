-- ============================================================
-- AgriWise AI — Supabase Schema
-- Jalankan di: Supabase Dashboard → SQL Editor → Run All
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. sessions (anonymous user tracking)
CREATE TABLE sessions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW(),
  metadata    JSONB DEFAULT '{}'
);

-- 2. recommendations (riwayat rekomendasi AI)
CREATE TABLE recommendations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id      UUID REFERENCES sessions(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  season          TEXT NOT NULL,
  elevation_m     INTEGER NOT NULL,
  province        TEXT,
  land_area_m2    INTEGER,
  budget_idr      BIGINT,
  weather_data    JSONB,
  ai_response     JSONB NOT NULL,
  season_summary  TEXT,
  model_used      TEXT DEFAULT 'claude-sonnet-4-20250514',
  duration_ms     INTEGER
);
CREATE INDEX idx_rec_session ON recommendations(session_id, created_at DESC);

-- 3. crop_prices (harga terkini per komoditas)
CREATE TABLE crop_prices (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crop_name     TEXT NOT NULL,
  crop_label    TEXT NOT NULL,
  price_per_kg  INTEGER NOT NULL,
  price_min     INTEGER,
  price_max     INTEGER,
  unit          TEXT DEFAULT 'kg',
  source        TEXT,
  region        TEXT DEFAULT 'nasional',
  recorded_at   TIMESTAMPTZ DEFAULT NOW(),
  is_latest     BOOLEAN DEFAULT TRUE
);
CREATE INDEX idx_prices_latest ON crop_prices(crop_name, region, is_latest, recorded_at DESC);
CREATE UNIQUE INDEX idx_prices_unique_latest ON crop_prices(crop_name, region) WHERE is_latest = TRUE;

-- 4. crop_price_history (untuk grafik tren 30 hari)
CREATE TABLE crop_price_history (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crop_name    TEXT NOT NULL,
  region       TEXT DEFAULT 'nasional',
  price_per_kg INTEGER NOT NULL,
  recorded_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_history_crop ON crop_price_history(crop_name, region, recorded_at DESC);

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE sessions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_prices        ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon insert session"  ON sessions        FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon read session"    ON sessions        FOR SELECT TO anon USING (true);
CREATE POLICY "anon insert rec"      ON recommendations FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon read rec"        ON recommendations FOR SELECT TO anon USING (true);
CREATE POLICY "public read prices"   ON crop_prices     FOR SELECT TO anon USING (true);
CREATE POLICY "public read history"  ON crop_price_history FOR SELECT TO anon USING (true);

-- ── Realtime ─────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE crop_prices;
ALTER PUBLICATION supabase_realtime ADD TABLE crop_price_history;

-- ── Function update harga ─────────────────────────────────────
CREATE OR REPLACE FUNCTION update_crop_price(
  p_crop_name TEXT, p_crop_label TEXT, p_price INTEGER,
  p_price_min INTEGER DEFAULT NULL, p_price_max INTEGER DEFAULT NULL,
  p_source TEXT DEFAULT 'system', p_region TEXT DEFAULT 'nasional'
) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE crop_prices SET is_latest = FALSE
    WHERE crop_name = p_crop_name AND region = p_region;
  INSERT INTO crop_prices (crop_name, crop_label, price_per_kg, price_min, price_max, source, region, is_latest)
    VALUES (p_crop_name, p_crop_label, p_price, p_price_min, p_price_max, p_source, p_region, TRUE);
  INSERT INTO crop_price_history (crop_name, region, price_per_kg)
    VALUES (p_crop_name, p_region, p_price);
END;
$$;

-- ── Seed data awal ────────────────────────────────────────────
SELECT update_crop_price('cabai_merah',  'Cabai Merah',   45000, 40000, 55000, 'seed', 'nasional');
SELECT update_crop_price('bawang_merah', 'Bawang Merah',  35000, 28000, 42000, 'seed', 'nasional');
SELECT update_crop_price('tomat',        'Tomat',         12000,  8000, 18000, 'seed', 'nasional');
SELECT update_crop_price('kentang',      'Kentang',       18000, 14000, 22000, 'seed', 'nasional');
SELECT update_crop_price('wortel',       'Wortel',        14000, 10000, 18000, 'seed', 'nasional');
SELECT update_crop_price('bayam',        'Bayam',          8000,  5000, 12000, 'seed', 'nasional');
SELECT update_crop_price('kangkung',     'Kangkung',       6000,  4000,  9000, 'seed', 'nasional');
SELECT update_crop_price('jagung',       'Jagung',         7000,  5000, 10000, 'seed', 'nasional');
SELECT update_crop_price('singkong',     'Singkong',       4000,  3000,  6000, 'seed', 'nasional');
SELECT update_crop_price('padi',         'Padi (Gabah)',   6500,  5500,  7500, 'seed', 'nasional');
