/*
  # Digital Marketplace Schema

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `slug` (text, unique)
      - `description` (text)
      - `image_url` (text)
      - `created_at` (timestamptz)
    
    - `collections`
      - `id` (uuid, primary key)
      - `name` (text)
      - `slug` (text, unique)
      - `description` (text)
      - `image_url` (text)
      - `featured` (boolean)
      - `created_at` (timestamptz)
    
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `slug` (text, unique)
      - `description` (text)
      - `price` (numeric)
      - `category_id` (uuid, foreign key)
      - `collection_id` (uuid, foreign key, nullable)
      - `image_url` (text)
      - `gallery_images` (jsonb, array of image URLs)
      - `featured` (boolean)
      - `stock` (integer)
      - `created_at` (timestamptz)
    
    - `cart_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `product_id` (uuid, foreign key)
      - `quantity` (integer)
      - `created_at` (timestamptz)
    
    - `orders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `total` (numeric)
      - `status` (text)
      - `items` (jsonb)
      - `shipping_address` (jsonb)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Public read access for categories, collections, and products
    - Authenticated users can manage their own cart and orders
*/

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  image_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO public
  USING (true);

-- Collections
CREATE TABLE IF NOT EXISTS collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  image_url text DEFAULT '',
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view collections"
  ON collections FOR SELECT
  TO public
  USING (true);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  price numeric NOT NULL CHECK (price >= 0),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  collection_id uuid REFERENCES collections(id) ON DELETE SET NULL,
  image_url text DEFAULT '',
  gallery_images jsonb DEFAULT '[]'::jsonb,
  featured boolean DEFAULT false,
  stock integer DEFAULT 0 CHECK (stock >= 0),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  TO public
  USING (true);

-- Cart Items
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity integer DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cart items"
  ON cart_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items"
  ON cart_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items"
  ON cart_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  total numeric NOT NULL CHECK (total >= 0),
  status text DEFAULT 'pending',
  items jsonb DEFAULT '[]'::jsonb,
  shipping_address jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Insert sample data
INSERT INTO categories (name, slug, description, image_url) VALUES
  ('Fashion', 'fashion', 'Curated fashion pieces', 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=1200'),
  ('Art', 'art', 'Contemporary art and prints', 'https://images.pexels.com/photos/1053924/pexels-photo-1053924.jpeg?auto=compress&cs=tinysrgb&w=1200'),
  ('Home', 'home', 'Modern home essentials', 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1200'),
  ('Design', 'design', 'Designer objects and furniture', 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=1200')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO collections (name, slug, description, image_url, featured) VALUES
  ('Spring 2026', 'spring-2026', 'Fresh perspectives for the new season', 'https://images.pexels.com/photos/1366957/pexels-photo-1366957.jpeg?auto=compress&cs=tinysrgb&w=1600', true),
  ('Minimalist', 'minimalist', 'Less is more', 'https://images.pexels.com/photos/2980955/pexels-photo-2980955.jpeg?auto=compress&cs=tinysrgb&w=1600', true),
  ('Limited Edition', 'limited-edition', 'Exclusive pieces', 'https://images.pexels.com/photos/2300334/pexels-photo-2300334.jpeg?auto=compress&cs=tinysrgb&w=1600', false)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, slug, description, price, category_id, collection_id, image_url, gallery_images, featured, stock) VALUES
  (
    'Architectural Vase',
    'architectural-vase',
    'A sculptural ceramic vase that doubles as a statement piece. Hand-thrown by artisans in Copenhagen, each piece is unique.',
    189.00,
    (SELECT id FROM categories WHERE slug = 'home' LIMIT 1),
    (SELECT id FROM collections WHERE slug = 'minimalist' LIMIT 1),
    'https://images.pexels.com/photos/5797903/pexels-photo-5797903.jpeg?auto=compress&cs=tinysrgb&w=1200',
    '["https://images.pexels.com/photos/5797903/pexels-photo-5797903.jpeg?auto=compress&cs=tinysrgb&w=1200"]'::jsonb,
    true,
    15
  ),
  (
    'Silk Midi Dress',
    'silk-midi-dress',
    'Flowing silk dress with a relaxed fit. Perfect for any occasion, crafted from 100% mulberry silk.',
    425.00,
    (SELECT id FROM categories WHERE slug = 'fashion' LIMIT 1),
    (SELECT id FROM collections WHERE slug = 'spring-2026' LIMIT 1),
    'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=1200',
    '["https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=1200"]'::jsonb,
    true,
    8
  ),
  (
    'Abstract Print #12',
    'abstract-print-12',
    'Limited edition giclée print on archival paper. Signed and numbered by the artist.',
    320.00,
    (SELECT id FROM categories WHERE slug = 'art' LIMIT 1),
    (SELECT id FROM collections WHERE slug = 'limited-edition' LIMIT 1),
    'https://images.pexels.com/photos/1585325/pexels-photo-1585325.jpeg?auto=compress&cs=tinysrgb&w=1200',
    '["https://images.pexels.com/photos/1585325/pexels-photo-1585325.jpeg?auto=compress&cs=tinysrgb&w=1200"]'::jsonb,
    true,
    25
  ),
  (
    'Walnut Lounge Chair',
    'walnut-lounge-chair',
    'Mid-century inspired lounge chair crafted from solid walnut. Italian leather upholstery.',
    1850.00,
    (SELECT id FROM categories WHERE slug = 'design' LIMIT 1),
    (SELECT id FROM collections WHERE slug = 'minimalist' LIMIT 1),
    'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=1200',
    '["https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=1200"]'::jsonb,
    true,
    5
  ),
  (
    'Cashmere Throw',
    'cashmere-throw',
    'Luxuriously soft cashmere throw. Woven in Scotland from the finest fibers.',
    395.00,
    (SELECT id FROM categories WHERE slug = 'home' LIMIT 1),
    (SELECT id FROM collections WHERE slug = 'spring-2026' LIMIT 1),
    'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1200',
    '["https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1200"]'::jsonb,
    false,
    20
  ),
  (
    'Leather Tote',
    'leather-tote',
    'Minimalist leather tote bag. Full-grain Italian leather with brass hardware.',
    580.00,
    (SELECT id FROM categories WHERE slug = 'fashion' LIMIT 1),
    (SELECT id FROM collections WHERE slug = 'minimalist' LIMIT 1),
    'https://images.pexels.com/photos/2442900/pexels-photo-2442900.jpeg?auto=compress&cs=tinysrgb&w=1200',
    '["https://images.pexels.com/photos/2442900/pexels-photo-2442900.jpeg?auto=compress&cs=tinysrgb&w=1200"]'::jsonb,
    false,
    12
  )
ON CONFLICT (slug) DO NOTHING;