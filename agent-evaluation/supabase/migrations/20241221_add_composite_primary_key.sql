-- Migration: Add composite primary key to navos_test_result table
-- This migration handles duplicate data and creates a composite primary key
-- using q_id, title, and user_name columns

-- Step 1: Create a temporary table to store unique records
CREATE TEMP TABLE navos_test_result_temp AS
SELECT DISTINCT ON (q_id, title, user_name)
    created_at,
    q_id,
    q_name,
    title,
    agent_type,
    item_visual,
    item_major,
    item_data,
    item_guide,
    agent_name,
    agent_scene,
    topic_id,
    user_name,
    test,
    test11
FROM navos_test_result
ORDER BY q_id, title, user_name, created_at DESC;

-- Step 2: Drop the existing primary key constraint
ALTER TABLE navos_test_result DROP CONSTRAINT IF EXISTS navos_test_result_pkey;

-- Step 3: Drop the id column since it's no longer needed as primary key
ALTER TABLE navos_test_result DROP COLUMN IF EXISTS id;

-- Step 4: Clear the original table
TRUNCATE TABLE navos_test_result;

-- Step 5: Insert unique records back
INSERT INTO navos_test_result (
    created_at, q_id, q_name, title, agent_type, item_visual, 
    item_major, item_data, item_guide, agent_name, agent_scene, 
    topic_id, user_name, test, test11
)
SELECT 
    created_at, q_id, q_name, title, agent_type, item_visual, 
    item_major, item_data, item_guide, agent_name, agent_scene, 
    topic_id, user_name, test, test11
FROM navos_test_result_temp;

-- Step 6: Ensure the composite key columns are not null
ALTER TABLE navos_test_result ALTER COLUMN q_id SET NOT NULL;
ALTER TABLE navos_test_result ALTER COLUMN title SET NOT NULL;
ALTER TABLE navos_test_result ALTER COLUMN user_name SET NOT NULL;

-- Step 7: Add the composite primary key constraint
ALTER TABLE navos_test_result ADD CONSTRAINT navos_test_result_pkey 
    PRIMARY KEY (q_id, title, user_name);

-- Step 8: Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_navos_test_result_composite 
    ON navos_test_result (q_id, title, user_name);

-- Step 9: Grant permissions to anon and authenticated roles
GRANT SELECT, INSERT, UPDATE, DELETE ON navos_test_result TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON navos_test_result TO authenticated;

-- Step 10: Drop the temporary table
DROP TABLE navos_test_result_temp;