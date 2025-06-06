-- Enable realtime for todostable
ALTER PUBLICATION supabase_realtime ADD TABLE todostable;

-- Grant necessary permissions for realtime
GRANT SELECT, INSERT, UPDATE, DELETE ON todostable TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
