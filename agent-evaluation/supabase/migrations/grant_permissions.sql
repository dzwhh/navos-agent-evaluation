-- Grant permissions for navos_question_data table
GRANT SELECT ON navos_question_data TO anon;
GRANT ALL PRIVILEGES ON navos_question_data TO authenticated;

-- Check current permissions
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'navos_question_data'
AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;