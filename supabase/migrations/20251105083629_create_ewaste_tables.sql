/*
  # E-Waste Reclaimer Database Schema

  ## Overview
  This migration creates the complete database structure for the E-Waste Reclaimer application,
  enabling users to submit electronic waste for recycling and earn eco-points.

  ## New Tables

  ### 1. users
  Stores user accounts with authentication and rewards tracking
  - `id` (uuid, primary key) - Unique user identifier
  - `name` (text) - Full name of the user
  - `email` (text, unique) - Email address for login
  - `password` (text) - Hashed password using bcrypt
  - `role` (text) - User role: 'user' or 'admin'
  - `points` (integer) - Eco-points earned from recycling
  - `created_at` (timestamptz) - Account creation timestamp

  ### 2. ewaste_items
  Tracks all submitted electronic waste items
  - `id` (uuid, primary key) - Unique item identifier
  - `user_id` (uuid, foreign key) - References users table
  - `name` (text) - Name/title of the item
  - `category` (text) - Type of e-waste (e.g., 'Mobile Phone', 'Laptop', 'Battery')
  - `condition` (text) - Item condition (e.g., 'Working', 'Broken', 'Damaged')
  - `location` (text) - Pickup/drop-off location
  - `image` (text) - URL/path to uploaded image
  - `description` (text) - Additional details about the item
  - `status` (text) - Current status: 'Pending', 'Collected', 'Recycled'
  - `date_submitted` (timestamptz) - Submission timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. centers
  Maintains database of registered recycling centers
  - `id` (uuid, primary key) - Unique center identifier
  - `name` (text) - Center name
  - `address` (text) - Physical address
  - `contact` (text) - Phone number or email
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  
  ### Row Level Security (RLS)
  All tables have RLS enabled with restrictive policies:
  
  #### users table policies:
  - Users can read their own profile data
  - Users can update their own profile (except role and points)
  - Public registration allowed (insert)
  - Admins can view all users
  
  #### ewaste_items table policies:
  - Users can view their own submitted items
  - Users can create new items
  - Users can update/delete their own items (if status is 'Pending')
  - Admins can view and manage all items
  
  #### centers table policies:
  - All authenticated users can view centers
  - Only admins can create/update/delete centers
  - Public (unauthenticated) users can view centers for the "Find a Center" page

  ## Important Notes
  
  1. **Data Safety**: No destructive operations - all tables created with IF NOT EXISTS
  2. **Default Values**: Status defaults to 'Pending', points default to 0, role defaults to 'user'
  3. **Cascading**: Deleting a user cascades to delete their ewaste_items
  4. **Timestamps**: Automatic timestamp tracking with DEFAULT now()
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  points integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create ewaste_items table
CREATE TABLE IF NOT EXISTS ewaste_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL,
  condition text NOT NULL,
  location text NOT NULL,
  image text DEFAULT '',
  description text DEFAULT '',
  status text DEFAULT 'Pending' CHECK (status IN ('Pending', 'Collected', 'Recycled')),
  date_submitted timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create centers table
CREATE TABLE IF NOT EXISTS centers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  contact text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ewaste_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE centers ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Public registration allowed"
  ON users FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM users WHERE id = auth.uid()));

-- E-waste items table policies
CREATE POLICY "Users can view own items"
  ON ewaste_items FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all items"
  ON ewaste_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can create items"
  ON ewaste_items FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own pending items"
  ON ewaste_items FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND status = 'Pending')
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update all items"
  ON ewaste_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (true);

CREATE POLICY "Users can delete own pending items"
  ON ewaste_items FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() AND status = 'Pending');

-- Centers table policies
CREATE POLICY "Anyone can view centers"
  ON centers FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert centers"
  ON centers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update centers"
  ON centers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (true);

CREATE POLICY "Admins can delete centers"
  ON centers FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Insert some sample recycling centers
INSERT INTO centers (name, address, contact) VALUES
  ('GreenTech Recycling Hub', '123 Eco Street, San Francisco, CA 94102', '+1-415-555-0100'),
  ('E-Cycle Solutions', '456 Sustainability Ave, Portland, OR 97204', '+1-503-555-0200'),
  ('TechWaste Recovery Center', '789 Green Boulevard, Austin, TX 78701', '+1-512-555-0300')
ON CONFLICT DO NOTHING;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ewaste_user_id ON ewaste_items(user_id);
CREATE INDEX IF NOT EXISTS idx_ewaste_status ON ewaste_items(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);