-- Create topic_list_data table for storing question set information
CREATE TABLE IF NOT EXISTS topic_list_data (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  creator VARCHAR(100) NOT NULL,
  status BOOLEAN DEFAULT true,
  description TEXT,
  question_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_topic_list_data_creator ON topic_list_data(creator);
CREATE INDEX IF NOT EXISTS idx_topic_list_data_status ON topic_list_data(status);
CREATE INDEX IF NOT EXISTS idx_topic_list_data_created_at ON topic_list_data(created_at);

-- Enable Row Level Security
ALTER TABLE topic_list_data ENABLE ROW LEVEL SECURITY;

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

-- Insert sample data
INSERT INTO topic_list_data (name, creator, status, description, question_count) VALUES
('AI代理基础能力测试', '张三', true, '测试AI代理的基本对话和理解能力', 3),
('编程能力评估', '李四', false, '评估AI代理的代码生成和调试能力', 2),
('多模态理解测试', '王五', true, '测试AI代理对图像、文本等多模态内容的理解', 1)
ON CONFLICT DO NOTHING;

-- Check permissions
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'topic_list_data'
AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;