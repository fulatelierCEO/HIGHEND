/*
  # Fix Security and Performance Issues

  ## Changes
  
  ### 1. Add Missing Indexes for Foreign Keys
    - `build_feed.product_id`
    - `build_in_public.product_id`
    - `user_purchases.product_id`
    - `user_purchases.user_id`
  
  ### 2. Optimize RLS Policies
    - Replace `auth.uid()` with `(select auth.uid())` to prevent re-evaluation per row
    - Affects: products, purchases, build_in_public, admin_users, leads tables
  
  ### 3. Enable RLS on Public Tables
    - Enable RLS on `user_purchases` table
    - Enable RLS on `build_feed` table
    - Add appropriate policies for authenticated access
  
  ### 4. Add RLS Policies for Profiles
    - Users can view their own profile
    - Users can update their own profile
    - Service role can manage all profiles
  
  ### 5. Fix Function Search Paths
    - Set search_path for `set_updated_at` function
    - Set search_path for `set_updated_at_metadata` function
    - Set search_path for `handle_new_user` function
  
  ### 6. Security Improvements
    - Remove overly permissive leads INSERT policy
    - Add proper validation for inquiry submissions
*/

-- Add indexes for foreign keys to improve query performance
CREATE INDEX IF NOT EXISTS idx_build_feed_product_id ON public.build_feed(product_id);
CREATE INDEX IF NOT EXISTS idx_build_in_public_product_id ON public.build_in_public(product_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_product_id ON public.user_purchases(product_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_user_id ON public.user_purchases(user_id);

-- Drop existing RLS policies that need optimization
DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
DROP POLICY IF EXISTS "Users can view own purchases" ON public.purchases;
DROP POLICY IF EXISTS "Admins can view all purchases" ON public.purchases;
DROP POLICY IF EXISTS "Admins can insert purchases" ON public.purchases;
DROP POLICY IF EXISTS "Admins can update purchases" ON public.purchases;
DROP POLICY IF EXISTS "Admins can view all videos" ON public.build_in_public;
DROP POLICY IF EXISTS "Admins can insert videos" ON public.build_in_public;
DROP POLICY IF EXISTS "Admins can update videos" ON public.build_in_public;
DROP POLICY IF EXISTS "Admins can delete videos" ON public.build_in_public;
DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can manage admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users can view all inquiries" ON public.leads;
DROP POLICY IF EXISTS "Admin users can update inquiries" ON public.leads;
DROP POLICY IF EXISTS "Anyone can submit inquiries" ON public.leads;

-- Recreate optimized RLS policies for products table
CREATE POLICY "Admins can view all products"
  ON public.products FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

-- Recreate optimized RLS policies for purchases table
CREATE POLICY "Users can view own purchases"
  ON public.purchases FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Admins can view all purchases"
  ON public.purchases FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Admins can insert purchases"
  ON public.purchases FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Admins can update purchases"
  ON public.purchases FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

-- Recreate optimized RLS policies for build_in_public table
CREATE POLICY "Admins can view all videos"
  ON public.build_in_public FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Admins can insert videos"
  ON public.build_in_public FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Admins can update videos"
  ON public.build_in_public FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Admins can delete videos"
  ON public.build_in_public FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

-- Recreate optimized RLS policies for admin_users table
CREATE POLICY "Admins can view admin users"
  ON public.admin_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Super admins can manage admin users"
  ON public.admin_users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = (select auth.uid())
      AND admin_users.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = (select auth.uid())
      AND admin_users.role = 'super_admin'
    )
  );

-- Recreate optimized RLS policies for leads table
CREATE POLICY "Admin users can view all inquiries"
  ON public.leads FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Admin users can update inquiries"
  ON public.leads FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Authenticated users can submit inquiries"
  ON public.leads FOR INSERT
  TO authenticated
  WITH CHECK (
    client_email IS NOT NULL 
    AND client_name IS NOT NULL 
    AND message IS NOT NULL
  );

-- Enable RLS on user_purchases table
ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for user_purchases
CREATE POLICY "Users can view own purchases"
  ON public.user_purchases FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Admins can view all user purchases"
  ON public.user_purchases FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Service role can manage user purchases"
  ON public.user_purchases FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Enable RLS on build_feed table
ALTER TABLE public.build_feed ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for build_feed
CREATE POLICY "Anyone can view published build feed"
  ON public.build_feed FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage build feed"
  ON public.build_feed FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = (select auth.uid())
    )
  );

-- Add RLS policies for profiles table
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Service role can manage all profiles"
  ON public.profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Fix function search paths
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP FUNCTION IF EXISTS public.set_updated_at_metadata() CASCADE;
CREATE OR REPLACE FUNCTION public.set_updated_at_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

-- Recreate triggers if they existed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'products'
  ) THEN
    DROP TRIGGER IF EXISTS set_updated_at_products ON public.products;
    CREATE TRIGGER set_updated_at_products
      BEFORE UPDATE ON public.products
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'leads'
  ) THEN
    DROP TRIGGER IF EXISTS set_updated_at_leads ON public.leads;
    CREATE TRIGGER set_updated_at_leads
      BEFORE UPDATE ON public.leads
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;
