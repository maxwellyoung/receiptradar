-- Fix Enhanced Scraping Database Migration
-- Corrects issues with the previous migration

-- Add missing columns to price_history table (only if they don't exist)
ALTER TABLE price_history ADD COLUMN IF NOT EXISTS volume_size TEXT;

-- Add indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_price_history_volume_size ON price_history(volume_size);

-- Add constraint to ensure valid confidence scores (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_confidence_score' 
        AND table_name = 'price_history'
    ) THEN
        ALTER TABLE price_history ADD CONSTRAINT check_confidence_score 
            CHECK (confidence_score >= 0 AND confidence_score <= 1);
    END IF;
END $$;

-- Create view for recent prices (last 30 days)
CREATE OR REPLACE VIEW recent_prices AS
SELECT 
    ph.*,
    s.name as store_name,
    s.location as store_location
FROM price_history ph
JOIN stores s ON ph.store_id = s.id
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