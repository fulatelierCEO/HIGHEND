/*
  # Transform to Templates Marketplace

  1. Changes to Existing Tables
    - Rename `products` to `templates`
    - Rename `collections` to `template_collections`
    - Add template-specific fields
  
  2. New Tables
    - `workshop_logs`
      - `id` (uuid, primary key)
      - `title` (text)
      - `slug` (text, unique)
      - `content` (text)
      - `excerpt` (text)
      - `image_url` (text)
      - `template_id` (uuid, foreign key, nullable)
      - `published_at` (timestamptz)
      - `created_at` (timestamptz)

  3. Security
    - Enable RLS on new tables
    - Public read access for workshop logs
*/

-- Rename collections to template_collections
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'collections'
  ) THEN
    ALTER TABLE collections RENAME TO template_collections;
  END IF;
END $$;

-- Rename products to templates
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'products'
  ) THEN
    ALTER TABLE products RENAME TO templates;
  END IF;
END $$;

-- Update foreign key references in cart_items
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cart_items' AND column_name = 'product_id'
  ) THEN
    ALTER TABLE cart_items RENAME COLUMN product_id TO template_id;
  END IF;
END $$;

-- Add template-specific columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'templates' AND column_name = 'demo_url'
  ) THEN
    ALTER TABLE templates ADD COLUMN demo_url text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'templates' AND column_name = 'tech_stack'
  ) THEN
    ALTER TABLE templates ADD COLUMN tech_stack jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'templates' AND column_name = 'features'
  ) THEN
    ALTER TABLE templates ADD COLUMN features jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Create workshop_logs table
CREATE TABLE IF NOT EXISTS workshop_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text DEFAULT '',
  excerpt text DEFAULT '',
  image_url text DEFAULT '',
  template_id uuid REFERENCES templates(id) ON DELETE SET NULL,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE workshop_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view workshop logs"
  ON workshop_logs FOR SELECT
  TO public
  USING (true);

-- Update sample data to be template-focused
UPDATE templates 
SET 
  name = CASE 
    WHEN name = 'Architectural Vase' THEN 'SaaS Dashboard Pro'
    WHEN name = 'Silk Midi Dress' THEN 'E-Commerce Starter'
    WHEN name = 'Abstract Print #12' THEN 'Portfolio Minimal'
    WHEN name = 'Walnut Lounge Chair' THEN 'Landing Page Kit'
    WHEN name = 'Cashmere Throw' THEN 'Blog CMS'
    WHEN name = 'Leather Tote' THEN 'Admin Template'
    ELSE name
  END,
  description = CASE 
    WHEN name = 'Architectural Vase' THEN 'Complete SaaS dashboard with authentication, billing, and analytics. Built with Next.js and Tailwind CSS.'
    WHEN name = 'Silk Midi Dress' THEN 'Full-featured e-commerce solution with cart, checkout, and payment integration. Production-ready.'
    WHEN name = 'Abstract Print #12' THEN 'Minimal portfolio template for creatives. Showcase your work with elegance and sophistication.'
    WHEN name = 'Walnut Lounge Chair' THEN 'High-converting landing page kit with multiple sections and variants. Built for marketing.'
    WHEN name = 'Cashmere Throw' THEN 'Modern blog and CMS template with Markdown support and dynamic routing.'
    WHEN name = 'Leather Tote' THEN 'Comprehensive admin dashboard with tables, charts, and user management.'
    ELSE description
  END,
  tech_stack = CASE 
    WHEN name = 'Architectural Vase' THEN '["Next.js", "TypeScript", "Tailwind CSS", "Supabase"]'::jsonb
    WHEN name = 'Silk Midi Dress' THEN '["React", "TypeScript", "Stripe", "Tailwind CSS"]'::jsonb
    WHEN name = 'Abstract Print #12' THEN '["Next.js", "MDX", "Framer Motion"]'::jsonb
    WHEN name = 'Walnut Lounge Chair' THEN '["Next.js", "Tailwind CSS", "shadcn/ui"]'::jsonb
    WHEN name = 'Cashmere Throw' THEN '["Next.js", "Contentlayer", "Tailwind CSS"]'::jsonb
    WHEN name = 'Leather Tote' THEN '["React", "TypeScript", "Recharts", "Tailwind CSS"]'::jsonb
    ELSE tech_stack
  END,
  features = CASE 
    WHEN name = 'Architectural Vase' THEN '["Authentication", "Billing Integration", "Analytics Dashboard", "Team Management"]'::jsonb
    WHEN name = 'Silk Midi Dress' THEN '["Shopping Cart", "Checkout Flow", "Product Management", "Order Tracking"]'::jsonb
    WHEN name = 'Abstract Print #12' THEN '["Project Gallery", "Case Studies", "Contact Form", "Responsive Design"]'::jsonb
    WHEN name = 'Walnut Lounge Chair' THEN '["Hero Sections", "Testimonials", "Pricing Tables", "CTA Blocks"]'::jsonb
    WHEN name = 'Cashmere Throw' THEN '["Markdown Posts", "Search", "Categories", "RSS Feed"]'::jsonb
    WHEN name = 'Leather Tote' THEN '["User Management", "Data Tables", "Charts", "Settings"]'::jsonb
    ELSE features
  END,
  demo_url = CASE 
    WHEN name = 'Architectural Vase' THEN 'https://demo.atelier.com/saas-dashboard'
    WHEN name = 'Silk Midi Dress' THEN 'https://demo.atelier.com/ecommerce'
    WHEN name = 'Abstract Print #12' THEN 'https://demo.atelier.com/portfolio'
    WHEN name = 'Walnut Lounge Chair' THEN 'https://demo.atelier.com/landing'
    WHEN name = 'Cashmere Throw' THEN 'https://demo.atelier.com/blog'
    WHEN name = 'Leather Tote' THEN 'https://demo.atelier.com/admin'
    ELSE demo_url
  END,
  image_url = CASE 
    WHEN name = 'Architectural Vase' THEN 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=1200'
    WHEN name = 'Silk Midi Dress' THEN 'https://images.pexels.com/photos/3944454/pexels-photo-3944454.jpeg?auto=compress&cs=tinysrgb&w=1200'
    WHEN name = 'Abstract Print #12' THEN 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=1200'
    WHEN name = 'Walnut Lounge Chair' THEN 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=1200'
    WHEN name = 'Cashmere Throw' THEN 'https://images.pexels.com/photos/261662/pexels-photo-261662.jpeg?auto=compress&cs=tinysrgb&w=1200'
    WHEN name = 'Leather Tote' THEN 'https://images.pexels.com/photos/265667/pexels-photo-265667.jpeg?auto=compress&cs=tinysrgb&w=1200'
    ELSE image_url
  END
WHERE name IN ('Architectural Vase', 'Silk Midi Dress', 'Abstract Print #12', 'Walnut Lounge Chair', 'Cashmere Throw', 'Leather Tote');

-- Update categories
UPDATE categories 
SET 
  name = CASE 
    WHEN slug = 'fashion' THEN 'SaaS'
    WHEN slug = 'art' THEN 'Marketing'
    WHEN slug = 'home' THEN 'E-Commerce'
    WHEN slug = 'design' THEN 'Portfolio'
    ELSE name
  END,
  description = CASE 
    WHEN slug = 'fashion' THEN 'Complete SaaS application templates'
    WHEN slug = 'art' THEN 'Landing pages and marketing sites'
    WHEN slug = 'home' THEN 'Online store and shop templates'
    WHEN slug = 'design' THEN 'Portfolio and showcase templates'
    ELSE description
  END,
  image_url = CASE 
    WHEN slug = 'fashion' THEN 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=1200'
    WHEN slug = 'art' THEN 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1200'
    WHEN slug = 'home' THEN 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=1200'
    WHEN slug = 'design' THEN 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=1200'
    ELSE image_url
  END;

-- Update template_collections
UPDATE template_collections 
SET 
  name = CASE 
    WHEN slug = 'spring-2026' THEN 'Trending 2026'
    WHEN slug = 'minimalist' THEN 'Minimalist'
    WHEN slug = 'limited-edition' THEN 'Premium'
    ELSE name
  END,
  description = CASE 
    WHEN slug = 'spring-2026' THEN 'The most popular templates of 2026'
    WHEN slug = 'minimalist' THEN 'Clean, minimal design templates'
    WHEN slug = 'limited-edition' THEN 'Premium templates with exclusive features'
    ELSE description
  END;

-- Insert sample workshop logs
INSERT INTO workshop_logs (title, slug, content, excerpt, image_url, template_id, published_at) VALUES
  (
    'Building the SaaS Dashboard Template',
    'building-saas-dashboard',
    'Today I completed the authentication flow for our new SaaS dashboard template. The challenge was creating a seamless onboarding experience...',
    'Behind the scenes of building our most comprehensive SaaS template',
    'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=1200',
    (SELECT id FROM templates WHERE slug = 'architectural-vase' LIMIT 1),
    NOW() - INTERVAL '2 days'
  ),
  (
    'Optimizing E-Commerce Performance',
    'optimizing-ecommerce-performance',
    'Performance is critical for e-commerce. Here''s how we achieved sub-second load times for our e-commerce template...',
    'Technical deep-dive into our e-commerce optimization strategy',
    'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1200',
    (SELECT id FROM templates WHERE slug = 'silk-midi-dress' LIMIT 1),
    NOW() - INTERVAL '5 days'
  ),
  (
    'Design Philosophy: Less is More',
    'design-philosophy-less-is-more',
    'Why we chose a minimalist approach for our portfolio template and how it benefits creatives...',
    'Exploring minimalism in modern web design',
    'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200',
    (SELECT id FROM templates WHERE slug = 'abstract-print-12' LIMIT 1),
    NOW() - INTERVAL '7 days'
  ),
  (
    'Launch Week: New Templates Incoming',
    'launch-week-new-templates',
    'Excited to announce our launch week! We''re releasing 3 new templates over the next 7 days...',
    'Big announcements and what''s coming next',
    'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1200',
    NULL,
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (slug) DO NOTHING;