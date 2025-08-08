-- Normalize stores table for scraping integration
-- 1) Add a stable external code for each store (e.g., countdown_001)
-- 2) Ensure views join price_history.store_id (UUID) to stores.id (UUID)

-- Add code column if missing
ALTER TABLE stores ADD COLUMN IF NOT EXISTS code TEXT UNIQUE;

-- Optional: ensure unique index exists (redundant if UNIQUE added above)
CREATE UNIQUE INDEX IF NOT EXISTS idx_stores_code_unique ON stores(code);

-- Backfill codes for known NZ supermarkets using store names if present
UPDATE stores SET code = 'countdown_001'
  WHERE code IS NULL AND lower(name) = 'countdown';
UPDATE stores SET code = 'paknsave_001'
  WHERE code IS NULL AND lower(name) IN ('pak''nsave','paknsave','pak n save');
UPDATE stores SET code = 'new_world_001'
  WHERE code IS NULL AND lower(name) = 'new world';
UPDATE stores SET code = 'fresh_choice_001'
  WHERE code IS NULL AND lower(name) = 'fresh choice';
UPDATE stores SET code = 'super_value_001'
  WHERE code IS NULL AND lower(name) = 'super value';

-- Ensure price_history table has the enhanced columns and uniqueness
ALTER TABLE price_history ADD COLUMN IF NOT EXISTS volume_size TEXT;
ALTER TABLE price_history ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Best-effort: add constraint (ignore error if it already exists)
ALTER TABLE price_history ADD CONSTRAINT IF NOT EXISTS check_confidence_score
  CHECK (confidence_score >= 0 AND confidence_score <= 1);

-- Recreate views to use canonical join on stores.id
DROP VIEW IF EXISTS recent_prices;
CREATE OR REPLACE VIEW recent_prices AS
SELECT 
  ph.*,
  s.name AS store_name,
  s.location AS store_location
FROM price_history ph
JOIN stores s ON ph.store_id = s.id
WHERE ph.date >= CURRENT_DATE - INTERVAL '30 days';

DROP VIEW IF EXISTS price_comparisons;
CREATE OR REPLACE VIEW price_comparisons AS
SELECT 
  rp.item_name,
  rp.store_id,
  rp.store_name,
  AVG(rp.price) AS avg_price,
  MIN(rp.price) AS min_price,
  MAX(rp.price) AS max_price,
  COUNT(*) AS price_count,
  MAX(rp.date) AS last_updated
FROM recent_prices rp
GROUP BY rp.item_name, rp.store_id, rp.store_name;


