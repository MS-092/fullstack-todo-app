-- Create todostable table
CREATE TABLE IF NOT EXISTS todostable (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todostable(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_status ON todostable(status);
CREATE INDEX IF NOT EXISTS idx_todos_priority ON todostable(priority);
CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todostable(due_date);

-- Enable Row Level Security
ALTER TABLE todostable ENABLE ROW LEVEL SECURITY;

-- Create policies for Row Level Security
CREATE POLICY "Users can view their own todostable" ON todostable
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own todostable" ON todostable
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own todostable" ON todostable
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own todostable" ON todostable
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_todos_updated_at 
  BEFORE UPDATE ON todostable 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
