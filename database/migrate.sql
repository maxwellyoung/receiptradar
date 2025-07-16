-- Migration script for ReceiptRadar v2.0
-- This script safely adds new tables and columns without conflicts

-- Enable necessary extensions (safe to run multiple times)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Add new columns to existing users table (safe)
DO $$ 
BEGIN
    -- Add premium columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_premium') THEN
        ALTER TABLE users ADD COLUMN is_premium BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'premium_expires_at') THEN
        ALTER TABLE users ADD COLUMN premium_expires_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'cashback_balance') THEN
        ALTER TABLE users ADD COLUMN cashback_balance DECIMAL(10,2) DEFAULT 0.00;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'total_savings') THEN
        ALTER TABLE users ADD COLUMN total_savings DECIMAL(10,2) DEFAULT 0.00;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'preferences') THEN
        ALTER TABLE users ADD COLUMN preferences JSONB DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'anonymized_id') THEN
        ALTER TABLE users ADD COLUMN anonymized_id UUID DEFAULT uuid_generate_v4();
    END IF;
END $$;

-- Add new columns to existing stores table (safe)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stores' AND column_name = 'chain_name') THEN
        ALTER TABLE stores ADD COLUMN chain_name VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stores' AND column_name = 'latitude') THEN
        ALTER TABLE stores ADD COLUMN latitude DECIMAL(10,8);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stores' AND column_name = 'longitude') THEN
        ALTER TABLE stores ADD COLUMN longitude DECIMAL(11,8);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stores' AND column_name = 'is_active') THEN
        ALTER TABLE stores ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stores' AND column_name = 'price_tracking_enabled') THEN
        ALTER TABLE stores ADD COLUMN price_tracking_enabled BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add new columns to existing receipts table (safe)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'receipts' AND column_name = 'store_id') THEN
        ALTER TABLE receipts ADD COLUMN store_id UUID REFERENCES stores(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'receipts' AND column_name = 'is_verified') THEN
        ALTER TABLE receipts ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'receipts' AND column_name = 'savings_identified') THEN
        ALTER TABLE receipts ADD COLUMN savings_identified DECIMAL(10,2) DEFAULT 0.00;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'receipts' AND column_name = 'cashback_earned') THEN
        ALTER TABLE receipts ADD COLUMN cashback_earned DECIMAL(10,2) DEFAULT 0.00;
    END IF;
END $$;

-- Add new columns to existing items table (safe)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'items' AND column_name = 'unit_price') THEN
        ALTER TABLE items ADD COLUMN unit_price DECIMAL(10,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'items' AND column_name = 'brand') THEN
        ALTER TABLE items ADD COLUMN brand VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'items' AND column_name = 'sku') THEN
        ALTER TABLE items ADD COLUMN sku VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'items' AND column_name = 'confidence_score') THEN
        ALTER TABLE items ADD COLUMN confidence_score DECIMAL(3,2) DEFAULT 0.0;
    END IF;
END $$;

-- Create new tables (only if they don't exist)
CREATE TABLE IF NOT EXISTS price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id),
    item_name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    source VARCHAR(50) DEFAULT 'receipt',
    confidence_score DECIMAL(3,2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(store_id, item_name, date, source)
);

CREATE TABLE IF NOT EXISTS basket_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_anonymized_id UUID NOT NULL,
    store_id UUID NOT NULL REFERENCES stores(id),
    total_amount DECIMAL(10,2) NOT NULL,
    item_count INTEGER NOT NULL,
    date DATE NOT NULL,
    items JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cashback_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id),
    item_name VARCHAR(255),
    category_id UUID REFERENCES categories(id),
    discount_amount DECIMAL(10,2),
    discount_percentage DECIMAL(5,2),
    min_purchase DECIMAL(10,2),
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cashback_redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    offer_id UUID NOT NULL REFERENCES cashback_offers(id),
    receipt_id UUID REFERENCES receipts(id),
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS price_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    item_name VARCHAR(255) NOT NULL,
    target_price DECIMAL(10,2) NOT NULL,
    store_id UUID REFERENCES stores(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_name VARCHAR(255) NOT NULL,
    api_key_hash VARCHAR(255) NOT NULL,
    permissions JSONB NOT NULL,
    rate_limit INTEGER DEFAULT 1000,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_receipts_user_date') THEN
        CREATE INDEX idx_receipts_user_date ON receipts(user_id, date);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_receipts_store_date') THEN
        CREATE INDEX idx_receipts_store_date ON receipts(store_id, date);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_items_receipt') THEN
        CREATE INDEX idx_items_receipt ON items(receipt_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_price_history_store_item') THEN
        CREATE INDEX idx_price_history_store_item ON price_history(store_id, item_name);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_price_history_date') THEN
        CREATE INDEX idx_price_history_date ON price_history(date);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_basket_snapshots_store_date') THEN
        CREATE INDEX idx_basket_snapshots_store_date ON basket_snapshots(store_id, date);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_cashback_offers_store_active') THEN
        CREATE INDEX idx_cashback_offers_store_active ON cashback_offers(store_id, is_active);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_price_alerts_user_active') THEN
        CREATE INDEX idx_price_alerts_user_active ON price_alerts(user_id, is_active);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_items_name_gin') THEN
        CREATE INDEX idx_items_name_gin ON items USING gin(name gin_trgm_ops);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_price_history_item_gin') THEN
        CREATE INDEX idx_price_history_item_gin ON price_history USING gin(item_name gin_trgm_ops);
    END IF;
END $$;

-- Create or replace functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_receipts_updated_at') THEN
        CREATE TRIGGER update_receipts_updated_at BEFORE UPDATE ON receipts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Create views (replace if they exist)
DROP VIEW IF EXISTS user_savings_summary;
CREATE VIEW user_savings_summary AS
SELECT 
    u.id,
    u.email,
    COUNT(r.id) as receipt_count,
    SUM(r.total_amount) as total_spent,
    SUM(r.savings_identified) as total_savings,
    SUM(r.cashback_earned) as total_cashback,
    AVG(r.total_amount) as avg_receipt_value
FROM users u
LEFT JOIN receipts r ON u.id = r.user_id
GROUP BY u.id, u.email;

DROP VIEW IF EXISTS store_price_competition;
CREATE VIEW store_price_competition AS
SELECT 
    s.name as store_name,
    ph.item_name,
    AVG(ph.price) as avg_price,
    MIN(ph.price) as min_price,
    MAX(ph.price) as max_price,
    COUNT(DISTINCT ph.date) as price_points,
    ph.date
FROM stores s
JOIN price_history ph ON s.id = ph.store_id
WHERE ph.date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY s.name, ph.item_name, ph.date
ORDER BY ph.item_name, avg_price;

-- Create anonymization function
CREATE OR REPLACE FUNCTION anonymize_basket_data()
RETURNS TRIGGER AS $$
BEGIN
    -- This function would anonymize basket data before inserting into basket_snapshots
    -- Implementation depends on specific anonymization requirements
    RETURN NEW;
END;
$$ language 'plpgsql'; 