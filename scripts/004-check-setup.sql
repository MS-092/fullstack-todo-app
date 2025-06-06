-- Check if todos table exists
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name = 'todostable';

-- Check table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'todostable'
ORDER BY ordinal_position;

-- Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'todostable';

-- Check RLS policies
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'todostable';

-- Check if realtime is enabled
SELECT 
  schemaname,
  tablename
FROM pg_publication_tables 
WHERE tablename = 'todostable';

-- Test data (will only work if you're authenticated and RLS allows it)
SELECT COUNT(*) as todo_count FROM todostable;
