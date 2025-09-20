-- Add row_num column to topic_list_data table
ALTER TABLE topic_list_data ADD COLUMN row_num INTEGER;

-- Create index for better performance
CREATE INDEX idx_topic_list_data_row_num ON topic_list_data(row_num);

-- Update existing records with row numbers based on creation order
WITH numbered_rows AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM topic_list_data
)
UPDATE topic_list_data 
SET row_num = numbered_rows.rn
FROM numbered_rows 
WHERE topic_list_data.id = numbered_rows.id;

-- Grant permissions for the updated table
GRANT ALL PRIVILEGES ON topic_list_data TO authenticated;
GRANT SELECT ON topic_list_data TO anon;