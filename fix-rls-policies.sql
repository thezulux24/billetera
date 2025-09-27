-- =============================================
-- Fix Row Level Security (RLS) Policies for Billetera App
-- =============================================

-- First, enable RLS on all tables if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;  
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROFILES TABLE POLICIES
-- =============================================

-- Drop existing profiles policies if they exist
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;

-- Create comprehensive profiles policies
CREATE POLICY "profiles_select_policy" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_policy" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy" ON profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_delete_policy" ON profiles
    FOR DELETE USING (auth.uid() = id);

-- =============================================
-- ACCOUNTS TABLE POLICIES  
-- =============================================

-- Drop existing accounts policies if they exist
DROP POLICY IF EXISTS "accounts_select_policy" ON accounts;
DROP POLICY IF EXISTS "accounts_insert_policy" ON accounts;
DROP POLICY IF EXISTS "accounts_update_policy" ON accounts;
DROP POLICY IF EXISTS "accounts_delete_policy" ON accounts;

-- Create accounts policies
CREATE POLICY "accounts_select_policy" ON accounts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "accounts_insert_policy" ON accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "accounts_update_policy" ON accounts
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "accounts_delete_policy" ON accounts
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- CATEGORIES TABLE POLICIES
-- =============================================

-- Drop existing categories policies if they exist
DROP POLICY IF EXISTS "categories_select_policy" ON categories;
DROP POLICY IF EXISTS "categories_insert_policy" ON categories;
DROP POLICY IF EXISTS "categories_update_policy" ON categories;
DROP POLICY IF EXISTS "categories_delete_policy" ON categories;

-- Create categories policies
CREATE POLICY "categories_select_policy" ON categories
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "categories_insert_policy" ON categories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "categories_update_policy" ON categories
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "categories_delete_policy" ON categories
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- TRANSACTIONS TABLE POLICIES
-- =============================================

-- Drop existing transactions policies if they exist
DROP POLICY IF EXISTS "transactions_select_policy" ON transactions;
DROP POLICY IF EXISTS "transactions_insert_policy" ON transactions;
DROP POLICY IF EXISTS "transactions_update_policy" ON transactions;
DROP POLICY IF EXISTS "transactions_delete_policy" ON transactions;

-- Create transactions policies
CREATE POLICY "transactions_select_policy" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "transactions_insert_policy" ON transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "transactions_update_policy" ON transactions
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "transactions_delete_policy" ON transactions
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- CREATE AUTOMATIC PROFILE CREATION TRIGGER
-- =============================================

-- Function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url, preferred_currency, language, timezone)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL),
        'USD',
        'es-ES',
        'America/Mexico_City'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists and create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- GRANT NECESSARY PERMISSIONS
-- =============================================

-- Grant permissions for authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Ensure the profiles table has the correct structure with all new columns
-- (This is just verification - the columns should already exist based on your schema)

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_id_idx ON profiles(id);
CREATE INDEX IF NOT EXISTS accounts_user_id_idx ON accounts(user_id);
CREATE INDEX IF NOT EXISTS categories_user_id_idx ON categories(user_id);  
CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_account_id_idx ON transactions(account_id);
CREATE INDEX IF NOT EXISTS transactions_category_id_idx ON transactions(category_id);

-- =============================================
-- VERIFICATION QUERIES (Optional - for testing)
-- =============================================

-- These are just for verification - you can run them to check if everything is working
-- SELECT * FROM profiles WHERE id = auth.uid();
-- SELECT policy_name, policy_definition FROM pg_policies WHERE tablename = 'profiles';