-- ReceiptRadar Database Schema
-- Supports consumer app + B2B data platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Users table (expanded for premium features)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_premium BOOLEAN DEFAULT FALSE,
    premium_expires_at TIMESTAMP WITH TIME ZONE,
    cashback_balance DECIMAL(10,2) DEFAULT 0.00,
    total_savings DECIMAL(10,2) DEFAULT 0.00,
    preferences JSONB DEFAULT '{}',
    anonymized_id UUID DEFAULT uuid_generate_v4(), -- For B2B data sharing
    active_household_id UUID -- The household a user is currently viewing
);

-- Households Table
CREATE TABLE households (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    owner_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Household Users (Join Table)
CREATE TABLE household_users (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member', -- e.g., 'admin', 'member'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, household_id)
);

-- Add foreign key constraint to users table for active_household_id
ALTER TABLE users ADD CONSTRAINT fk_active_household FOREIGN KEY (active_household_id) REFERENCES households(id) ON DELETE SET NULL;

-- Stores table (expanded for price tracking)
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(500),
    chain_name VARCHAR(255),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    price_tracking_enabled BOOLEAN DEFAULT FALSE
);

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    color VARCHAR(7),
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    parent_category_id UUID REFERENCES categories(id)
);

-- Receipts table (expanded for analytics)
CREATE TABLE receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    household_id UUID REFERENCES households(id) ON DELETE CASCADE, -- Receipts can belong to a household
    store_id UUID REFERENCES stores(id),
    store_name VARCHAR(255) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    image_url VARCHAR(500),
    ocr_data JSONB,
    category_id UUID REFERENCES categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT FALSE,
    savings_identified DECIMAL(10,2) DEFAULT 0.00,
    cashback_earned DECIMAL(10,2) DEFAULT 0.00
);

-- Items table (expanded for price intelligence)
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_id UUID NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    category_id UUID REFERENCES categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unit_price DECIMAL(10,2),
    brand VARCHAR(255),
    sku VARCHAR(255),
    confidence_score DECIMAL(3,2) DEFAULT 0.0
);

-- Price tracking table (core of B2B value)
CREATE TABLE price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id),
    item_name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    source VARCHAR(50) DEFAULT 'receipt', -- receipt, scraper, api
    confidence_score DECIMAL(3,2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(store_id, item_name, date, source)
);

-- Basket intelligence (anonymized for B2B)
CREATE TABLE basket_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_anonymized_id UUID NOT NULL,
    store_id UUID NOT NULL REFERENCES stores(id),
    total_amount DECIMAL(10,2) NOT NULL,
    item_count INTEGER NOT NULL,
    date DATE NOT NULL,
    items JSONB NOT NULL, -- anonymized item list
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cashback and coupons
CREATE TABLE cashback_offers (
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

-- User cashback redemptions
CREATE TABLE cashback_redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    offer_id UUID NOT NULL REFERENCES cashback_offers(id),
    receipt_id UUID REFERENCES receipts(id),
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, paid
    redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Price alerts for premium users
CREATE TABLE price_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    item_name VARCHAR(255) NOT NULL,
    target_price DECIMAL(10,2) NOT NULL,
    store_id UUID REFERENCES stores(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- B2B API access
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_name VARCHAR(255) NOT NULL,
    api_key_hash VARCHAR(255) NOT NULL,
    permissions JSONB NOT NULL,
    rate_limit INTEGER DEFAULT 1000,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX idx_receipts_user_date ON receipts(user_id, date);
CREATE INDEX idx_receipts_store_date ON receipts(store_id, date);
CREATE INDEX idx_items_receipt ON items(receipt_id);
CREATE INDEX idx_price_history_store_item ON price_history(store_id, item_name);
CREATE INDEX idx_price_history_date ON price_history(date);
CREATE INDEX idx_basket_snapshots_store_date ON basket_snapshots(store_id, date);
CREATE INDEX idx_cashback_offers_store_active ON cashback_offers(store_id, is_active);
CREATE INDEX idx_price_alerts_user_active ON price_alerts(user_id, is_active);

-- Full-text search indexes
CREATE INDEX idx_items_name_gin ON items USING gin(name gin_trgm_ops);
CREATE INDEX idx_price_history_item_gin ON price_history USING gin(item_name gin_trgm_ops);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_receipts_updated_at BEFORE UPDATE ON receipts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_households_updated_at BEFORE UPDATE ON households FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for analytics
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

-- Functions for data anonymization
CREATE OR REPLACE FUNCTION anonymize_basket_data()
RETURNS TRIGGER AS $$
BEGIN
    -- This function would anonymize basket data before inserting into basket_snapshots
    -- Implementation depends on specific anonymization requirements
    RETURN NEW;
END;
$$ language 'plpgsql';