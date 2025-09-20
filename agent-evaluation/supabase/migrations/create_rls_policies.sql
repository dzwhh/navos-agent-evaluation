-- Create RLS policies for navos_question_data table

-- Allow anonymous users to insert data
CREATE POLICY "Allow anonymous insert" ON navos_question_data
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous users to select data
CREATE POLICY "Allow anonymous select" ON navos_question_data
  FOR SELECT
  TO anon
  USING (true);

-- Allow authenticated users full access
CREATE POLICY "Allow authenticated all" ON navos_question_data
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'navos_question_data';