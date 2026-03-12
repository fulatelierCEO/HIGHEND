/*
  # Admin Dashboard Schema for Atelier Ecosystem
  
  1. New Tables
    - `products`
      - Unified table for SaaS subscriptions, templates, and custom services
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `type` (text) - 'saas', 'template', 'service'
      - `price` (numeric)
      - `stripe_price_id` (text)
      - `stripe_product_id` (text)
      - `status` (text) - 'live', 'draft'
      - `file_url` (text) - for templates
      - `image_url` (text)
      - `features` (jsonb) - array of features
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `purchases`
      - Tracks customer purchases and access
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `product_id` (uuid, references products)
      - `stripe_session_id` (text)
      - `stripe_payment_intent` (text)
      - `amount` (numeric)
      - `status` (text) - 'completed', 'pending', 'refunded'
      - `purchased_at` (timestamptz)
      - `created_at` (timestamptz)
    
    - `build_in_public`
      - Video content for build-in-public studio
      - `id` (uuid, primary key)
      - `title` (text)
      - `caption` (text)
      - `video_url` (text)
      - `product_id` (uuid, references products) - tagged product
      - `thumbnail_url` (text)
      - `published` (boolean)
      - `published_at` (timestamptz)
      - `created_at` (timestamptz)
    
    - `admin_users`
      - Whitelist of admin user IDs
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users, unique)
      - `role` (text) - 'admin', 'super_admin'
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Admin tables: Only accessible by whitelisted admin users
    - Products: Public read for 'live' products, admin-only write
    - Purchases: Users can read their own, admin can read all
    - Build-in-public: Public read if published, admin-only write
  
  3. Indexes
    - Index on user_id for purchases
    - Index on product_id for purchases
    - Index on status for products
    - Index on published for build_in_public
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('saas', 'template', 'service')),
  price numeric NOT NULL DEFAULT 0,
  stripe_price_id text,
  stripe_product_id text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('live', 'draft')),
  file_url text,
  image_url text,
  features jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  stripe_session_id text,
  stripe_payment_intent text,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('completed', 'pending', 'refunded')),
  purchased_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create build_in_public table
CREATE TABLE IF NOT EXISTS build_in_public (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  caption text,
  video_url text NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  thumbnail_url text,
  published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_product_id ON purchases(product_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_build_in_public_published ON build_in_public(published);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_in_public ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Public can view live products"
  ON products FOR SELECT
  USING (status = 'live');

CREATE POLICY "Admins can view all products"
  ON products FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Purchases policies
CREATE POLICY "Users can view own purchases"
  ON purchases FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all purchases"
  ON purchases FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert purchases"
  ON purchases FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update purchases"
  ON purchases FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Build-in-public policies
CREATE POLICY "Public can view published videos"
  ON build_in_public FOR SELECT
  USING (published = true);

CREATE POLICY "Admins can view all videos"
  ON build_in_public FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert videos"
  ON build_in_public FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update videos"
  ON build_in_public FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete videos"
  ON build_in_public FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Admin users policies (only admins can manage admins)
CREATE POLICY "Admins can view admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can manage admin users"
  ON admin_users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.role = 'super_admin'
    )
  );