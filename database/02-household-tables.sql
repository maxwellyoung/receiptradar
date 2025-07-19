-- Add household tables to support household functionality
-- This migration adds the missing tables that are referenced in the API

-- First, ensure the update_updated_at_column function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Households Table
CREATE TABLE IF NOT EXISTS households (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    owner_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Household Users (Join Table)
CREATE TABLE IF NOT EXISTS household_users (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member', -- e.g., 'admin', 'member'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, household_id)
);

-- Add foreign key constraint to users table for active_household_id
-- First, add the column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'active_household_id') THEN
        ALTER TABLE users ADD COLUMN active_household_id UUID;
    END IF;
END $$;

-- Then add the foreign key constraint
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_active_household') THEN
        ALTER TABLE users ADD CONSTRAINT fk_active_household 
        FOREIGN KEY (active_household_id) REFERENCES households(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add household_id column to receipts table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'receipts' AND column_name = 'household_id') THEN
        ALTER TABLE receipts ADD COLUMN household_id UUID REFERENCES households(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_households_owner ON households(owner_id);
CREATE INDEX IF NOT EXISTS idx_household_users_user ON household_users(user_id);
CREATE INDEX IF NOT EXISTS idx_household_users_household ON household_users(household_id);
CREATE INDEX IF NOT EXISTS idx_receipts_household ON receipts(household_id);

-- Add trigger for updated_at on households table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers 
                   WHERE trigger_name = 'update_households_updated_at') THEN
        CREATE TRIGGER update_households_updated_at 
            BEFORE UPDATE ON households 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$; 