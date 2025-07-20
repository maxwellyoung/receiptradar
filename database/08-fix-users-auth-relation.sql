-- Fix users table to properly relate to auth.users
-- This migration ensures the users table works with Supabase Auth

-- First, drop the existing foreign key constraint if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'users_id_fkey' AND table_name = 'users') THEN
        ALTER TABLE users DROP CONSTRAINT users_id_fkey;
    END IF;
END $$;

-- Drop the primary key constraint temporarily
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_pkey;

-- Add the foreign key constraint to auth.users
ALTER TABLE users ADD CONSTRAINT users_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Re-add the primary key constraint
ALTER TABLE users ADD CONSTRAINT users_pkey PRIMARY KEY (id);

-- Create a trigger to automatically create a user profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, created_at, updated_at)
    VALUES (NEW.id, NEW.email, NEW.created_at, NEW.updated_at);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers 
                   WHERE trigger_name = 'on_auth_user_created') THEN
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
END $$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.households TO anon, authenticated;
GRANT ALL ON public.household_users TO anon, authenticated;
GRANT ALL ON public.receipts TO anon, authenticated;
GRANT ALL ON public.items TO anon, authenticated;
GRANT ALL ON public.stores TO anon, authenticated;
GRANT ALL ON public.categories TO anon, authenticated;

-- Enable RLS (Row Level Security) on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id); 