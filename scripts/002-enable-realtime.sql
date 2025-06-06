-- Enable realtime for todos table
ALTER PUBLICATION supabase_realtime ADD TABLE todos;

-- Grant necessary permissions for realtime
GRANT SELECT, INSERT, UPDATE, DELETE ON todos TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
