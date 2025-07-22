CREATE TABLE IF NOT EXISTS item_corrections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    receipt_id UUID NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    corrected_name VARCHAR(255),
    corrected_price DECIMAL(10,2),
    corrected_quantity INTEGER,
    corrected_category VARCHAR(255),
    confirmed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
); 