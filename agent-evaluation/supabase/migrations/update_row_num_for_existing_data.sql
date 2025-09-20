-- Update row_num for existing records that don't have it
-- This script ensures all existing topic_list_data records have proper row numbers

-- First, check current state
SELECT id, name, row_num, created_at 
FROM topic_list_data 
ORDER BY created_at;

-- Update records that have NULL row_num
WITH numbered_rows AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM topic_list_data
  WHERE row_num IS NULL
)
UPDATE topic_list_data 
SET row_num = numbered_rows.rn + COALESCE(
  (SELECT MAX(row_num) FROM topic_list_data WHERE row_num IS NOT NULL), 0
)
FROM numbered_rows 
WHERE topic_list_data.id = numbered_rows.id;

-- If all records have NULL row_num, assign sequential numbers
WITH all_numbered_rows AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM topic_list_data
  WHERE NOT EXISTS (SELECT 1 FROM topic_list_data WHERE row_num IS NOT NULL)
)
UPDATE topic_list_data 
SET row_num = all_numbered_rows.rn
FROM all_numbered_rows 
WHERE topic_list_data.id = all_numbered_rows.id;

-- Verify the update
SELECT id, name, row_num, created_at 
FROM topic_list_data 
ORDER BY row_num;