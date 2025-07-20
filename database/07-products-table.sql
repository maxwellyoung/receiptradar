-- Create products table for storing product information with images
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  image_url TEXT,
  description TEXT,
  brand TEXT,
  typical_price DECIMAL(10,2),
  stores TEXT[], -- Array of store names where this product is available
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on category for faster filtering
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Create index on brand for faster filtering
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);

-- Create index on stores array for faster searching
CREATE INDEX IF NOT EXISTS idx_products_stores ON products USING GIN(stores);

-- Create full text search index on name and description
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Add RLS policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read products
CREATE POLICY "Allow authenticated users to read products" ON products
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert products (for admin purposes)
CREATE POLICY "Allow authenticated users to insert products" ON products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update products (for admin purposes)
CREATE POLICY "Allow authenticated users to update products" ON products
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_products_updated_at(); 