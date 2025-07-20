-- Enhanced Scraping Database Migration
-- Adds missing columns for enhanced price scraping

-- Add missing columns to price_history table
ALTER TABLE price_history ADD COLUMN IF NOT EXISTS volume_size TEXT;
ALTER TABLE price_history ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create stores table if it doesn't exist
CREATE TABLE IF NOT EXISTS stores (
    id SERIAL PRIMARY KEY,
    store_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(200),
    base_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert NZ supermarket stores
INSERT INTO stores (store_id, name, location, base_url) VALUES
    ('countdown_001', 'Countdown', 'New Zealand', 'https://shop.countdown.co.nz'),
    ('paknsave_001', 'Pak''nSave', 'New Zealand', 'https://www.paknsaveonline.co.nz'),
    ('new_world_001', 'New World', 'New Zealand', 'https://shop.newworld.co.nz'),
    ('fresh_choice_001', 'Fresh Choice', 'New Zealand', 'https://nelsoncity.store.freshchoice.co.nz'),
    ('super_value_001', 'Super Value', 'New Zealand', 'https://stanmore.store.supervalue.co.nz')
ON CONFLICT (store_id) DO UPDATE SET
    name = EXCLUDED.name,
    location = EXCLUDED.location,
    base_url = EXCLUDED.base_url,
    updated_at = NOW();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_price_history_volume_size ON price_history(volume_size);
CREATE INDEX IF NOT EXISTS idx_price_history_image_url ON price_history(image_url);
CREATE INDEX IF NOT EXISTS idx_price_history_source ON price_history(source);

-- Add constraint to ensure valid confidence scores
ALTER TABLE price_history ADD CONSTRAINT IF NOT EXISTS check_confidence_score 
    CHECK (confidence_score >= 0 AND confidence_score <= 1);

-- Create view for recent prices (last 30 days)
CREATE OR REPLACE VIEW recent_prices AS
SELECT 
    ph.*,
    s.name as store_name,
    s.location as store_location
FROM price_history ph
JOIN stores s ON ph.store_id = s.store_id
WHERE ph.date >= CURRENT_DATE - INTERVAL '30 days';

-- Create view for price comparisons
CREATE OR REPLACE VIEW price_comparisons AS
SELECT 
    item_name,
    store_id,
    store_name,
    AVG(price) as avg_price,
    MIN(price) as min_price,
    MAX(price) as max_price,
    COUNT(*) as price_count,
    MAX(date) as last_updated
FROM recent_prices
GROUP BY item_name, store_id, store_name;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE ON price_history TO your_app_user;
-- GRANT SELECT ON stores TO your_app_user;
-- GRANT SELECT ON recent_prices TO your_app_user;
-- GRANT SELECT ON price_comparisons TO your_app_user; 