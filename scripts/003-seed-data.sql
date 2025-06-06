-- Optional: Insert sample data for testing
-- Note: This will only work if you have a user account created
-- Replace 'your-user-id' with an actual user ID from auth.users table

-- First, let's create a sample todo (you can skip this if you prefer to start fresh)
-- INSERT INTO todos (title, description, status, priority, due_date, user_id) 
-- VALUES (
--   'Welcome to TodoMaster!',
--   'This is your first task. You can edit or delete it anytime.',
--   'pending',
--   'medium',
--   CURRENT_DATE + INTERVAL '7 days',
--   'your-user-id-here'
-- );

-- To get your user ID after creating an account, run:
-- SELECT id, email FROM auth.users;
