-- Update navos_user_info table structure and permissions

-- Add missing columns if they don't exist
ALTER TABLE navos_user_info 
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS full_name VARCHAR(200),
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_navos_user_info_user_name ON navos_user_info(user_name);
CREATE INDEX IF NOT EXISTS idx_navos_user_info_email ON navos_user_info(email);
CREATE INDEX IF NOT EXISTS idx_navos_user_info_role ON navos_user_info(role);

-- Ensure RLS is enabled
ALTER TABLE navos_user_info ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to view all users" ON navos_user_info;
DROP POLICY IF EXISTS "Allow authenticated users to insert users" ON navos_user_info;
DROP POLICY IF EXISTS "Allow authenticated users to update users" ON navos_user_info;
DROP POLICY IF EXISTS "Allow authenticated users to delete users" ON navos_user_info;
DROP POLICY IF EXISTS "Allow anonymous select for login" ON navos_user_info;

-- Create RLS policies for authenticated users
CREATE POLICY "Allow authenticated users to view all users" ON navos_user_info
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert users" ON navos_user_info
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update users" ON navos_user_info
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete users" ON navos_user_info
  FOR DELETE TO authenticated USING (true);

-- Create policy for anonymous users (for login verification)
CREATE POLICY "Allow anonymous select for login" ON navos_user_info
  FOR SELECT TO anon USING (true);

-- Grant permissions to anon role (for login verification)
GRANT SELECT ON navos_user_info TO anon;

-- Grant full privileges to authenticated role
GRANT ALL PRIVILEGES ON navos_user_info TO authenticated;

-- Grant sequence permissions
GRANT USAGE, SELECT ON SEQUENCE navos_user_info_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE navos_user_info_id_seq TO authenticated;



-- Insert default users if they don't exist
INSERT INTO navos_user_info (user_name, password, email, full_name, role, is_active)
SELECT 'admin', 'admin123', 'admin@example.com', 'System Administrator', 'admin', true
WHERE NOT EXISTS (
    SELECT 1 FROM navos_user_info 
    WHERE user_name = 'admin'
);

INSERT INTO navos_user_info (user_name, password, email, full_name, role, is_active)
SELECT 'evaluator1', 'eval123', 'evaluator1@example.com', 'Evaluator One', 'evaluator', true
WHERE NOT EXISTS (
    SELECT 1 FROM navos_user_info 
    WHERE user_name = 'evaluator1'
);