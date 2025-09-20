-- Update topic_list_data table structure
-- Add missing columns and rename existing ones

-- Add name column (rename from topic_name if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'topic_list_data' AND column_name = 'topic_name') THEN
        ALTER TABLE topic_list_data RENAME COLUMN topic_name TO name;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'topic_list_data' AND column_name = 'name') THEN
        ALTER TABLE topic_list_data ADD COLUMN name VARCHAR(255) NOT NULL DEFAULT 'Untitled Topic';
    END IF;
END $$;

-- Add description column (rename from desc if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'topic_list_data' AND column_name = 'desc') THEN
        ALTER TABLE topic_list_data RENAME COLUMN "desc" TO description;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'topic_list_data' AND column_name = 'description') THEN
        ALTER TABLE topic_list_data ADD COLUMN description TEXT;
    END IF;
END $$;

-- Add question_count column if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'topic_list_data' AND column_name = 'question_count') THEN
        ALTER TABLE topic_list_data ADD COLUMN question_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add updated_at column if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'topic_list_data' AND column_name = 'updated_at') THEN
        ALTER TABLE topic_list_data ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Update creator column to be NOT NULL with default value
ALTER TABLE topic_list_data ALTER COLUMN creator SET DEFAULT 'Unknown';
UPDATE topic_list_data SET creator = 'Unknown' WHERE creator IS NULL;
ALTER TABLE topic_list_data ALTER COLUMN creator SET NOT NULL;

-- Update status column to have default value
ALTER TABLE topic_list_data ALTER COLUMN status SET DEFAULT true;
UPDATE topic_list_data SET status = true WHERE status IS NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_topic_list_data_creator ON topic_list_data(creator);
CREATE INDEX IF NOT EXISTS idx_topic_list_data_status ON topic_list_data(status);
CREATE INDEX IF NOT EXISTS idx_topic_list_data_created_at ON topic_list_data(created_at);

-- Ensure RLS is enabled
ALTER TABLE topic_list_data ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to view all topic lists" ON topic_list_data;
DROP POLICY IF EXISTS "Allow authenticated users to insert topic lists" ON topic_list_data;
DROP POLICY IF EXISTS "Allow authenticated users to update their own topic lists" ON topic_list_data;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own topic lists" ON topic_list_data;

-- Create RLS policies
CREATE POLICY "Allow authenticated users to view all topic lists" ON topic_list_data
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert topic lists" ON topic_list_data
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update their own topic lists" ON topic_list_data
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to delete their own topic lists" ON topic_list_data
  FOR DELETE TO authenticated USING (true);

-- Grant permissions
GRANT SELECT ON topic_list_data TO anon;
GRANT ALL PRIVILEGES ON topic_list_data TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE topic_list_data_id_seq TO authenticated;

-- Insert sample data if table is empty
INSERT INTO topic_list_data (name, creator, status, description, question_count) 
SELECT 'AI代理基础能力测试', '张三', true, '测试AI代理的基本对话和理解能力', 3
WHERE NOT EXISTS (SELECT 1 FROM topic_list_data WHERE name = 'AI代理基础能力测试');

INSERT INTO topic_list_data (name, creator, status, description, question_count) 
SELECT '编程能力评估', '李四', false, '评估AI代理的代码生成和调试能力', 2
WHERE NOT EXISTS (SELECT 1 FROM topic_list_data WHERE name = '编程能力评估');

INSERT INTO topic_list_data (name, creator, status, description, question_count) 
SELECT '多模态理解测试', '王五', true, '测试AI代理对图像、文本等多模态内容的理解', 1
WHERE NOT EXISTS (SELECT 1 FROM topic_list_data WHERE name = '多模态理解测试');

-- Check permissions
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'topic_list_data'
AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;