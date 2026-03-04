/*
  # Admin Dashboard Tables

  1. New Tables
    - `admin_users`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `role` (text)
      - `created_at` (timestamptz)
    
    - `consulting_inquiries`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text)
      - `company` (text)
      - `message` (text)
      - `status` (text: new, contacted, closed)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Updates to Existing Tables
    - Add `video_url` to workshop_logs for video embeds

  3. Security
    - Enable RLS on all new tables
    - Admin-only access for admin tables
    - Public can create consulting inquiries
*/

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text DEFAULT 'admin',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Create consulting_inquiries table
CREATE TABLE IF NOT EXISTS consulting_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  company text DEFAULT '',
  message text NOT NULL,
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE consulting_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create inquiries"
  ON consulting_inquiries FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can view all inquiries"
  ON consulting_inquiries FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can update inquiries"
  ON consulting_inquiries FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete inquiries"
  ON consulting_inquiries FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Add video_url to workshop_logs if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workshop_logs' AND column_name = 'video_url'
  ) THEN
    ALTER TABLE workshop_logs ADD COLUMN video_url text DEFAULT '';
  END IF;
END $$;

-- Add admin policies for templates management
CREATE POLICY "Admins can insert templates"
  ON templates FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can update templates"
  ON templates FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete templates"
  ON templates FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Add admin policies for workshop_logs management
CREATE POLICY "Admins can insert workshop logs"
  ON workshop_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can update workshop logs"
  ON workshop_logs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete workshop logs"
  ON workshop_logs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Insert sample consulting inquiries
INSERT INTO consulting_inquiries (name, email, company, message, status) VALUES
  ('Sarah Chen', 'sarah@techstartup.com', 'TechStartup Inc', 'We need help building a custom SaaS dashboard for our team. Looking for consultation on architecture and implementation.', 'new'),
  ('Michael Torres', 'mike@designstudio.co', 'Design Studio Co', 'Interested in customizing one of your templates for our client project. Can we discuss licensing and support?', 'contacted'),
  ('Emma Rodriguez', 'emma@ecommerce.shop', 'E-Shop', 'We love your e-commerce template! Need guidance on integrating with our existing payment system.', 'new')
ON CONFLICT DO NOTHING;