-- Create navos_user_info table for storing user information
CREATE TABLE IF NOT EXISTS navos_user_info (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  full_name VARCHAR(200),
  role VARCHAR(50) DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_navos_user_info_username ON navos_user_info(username);
CREATE INDEX IF NOT EXISTS idx_navos_user_info_email ON navos_user_info(email);
CREATE INDEX IF NOT EXISTS idx_navos_user_info_role ON navos_user_info(role);

-- Enable Row Level Security (RLS)
ALTER TABLE navos_user_info ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to view all users" ON navos_user_info;
DROP POLICY IF EXISTS "Allow authenticated users to insert users" ON navos_user_info;
DROP POLICY IF EXISTS "Allow authenticated users to update users" ON navos_user_info;
DROP POLICY IF EXISTS "Allow authenticated users to delete users" ON navos_user_info;
DROP POLICY IF EXISTS "Allow anonymous select for login" ON navos_user_info;

-- Create RLS policies
-- Allow authenticated users to view all users
CREATE POLICY "Allow authenticated users to view all users" ON navos_user_info
  FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to insert new users
CREATE POLICY "Allow authenticated users to insert users" ON navos_user_info
  FOR INSERT TO authenticated WITH CHECK (true);

-- Allow authenticated users to update user information
CREATE POLICY "Allow authenticated users to update users" ON navos_user_info
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Allow authenticated users to delete users
CREATE POLICY "Allow authenticated users to delete users" ON navos_user_info
  FOR DELETE TO authenticated USING (true);

-- Allow anonymous users to select for login verification
CREATE POLICY "Allow anonymous select for login" ON navos_user_info
  FOR SELECT TO anon USING (true);

-- Grant permissions to roles
-- Grant SELECT permission to anon role (for login verification)
GRANT SELECT ON navos_user_info TO anon;

-- Grant full privileges to authenticated role
GRANT ALL PRIVILEGES ON navos_user_info TO authenticated;

-- Grant usage on sequence to both roles
GRANT USAGE, SELECT ON SEQUENCE navos_user_info_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE navos_user_info_id_seq TO authenticated;