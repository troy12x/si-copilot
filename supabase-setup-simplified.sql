-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create a users table to sync with Clerk users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Create the datasets table with TEXT id instead of UUID
CREATE TABLE IF NOT EXISTS datasets (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  config JSONB,
  data JSONB NOT NULL,
  row_count INTEGER NOT NULL,
  size_bytes INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Add a foreign key constraint to the users table
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_datasets_user_id ON datasets (user_id);
CREATE INDEX IF NOT EXISTS idx_datasets_created_at ON datasets (created_at);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own data" 
  ON users 
  FOR SELECT 
  USING (auth.uid()::TEXT = id);

-- Create policies for datasets table
CREATE POLICY "Users can view their own datasets" 
  ON datasets 
  FOR SELECT 
  USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can insert their own datasets" 
  ON datasets 
  FOR INSERT 
  WITH CHECK (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can update their own datasets" 
  ON datasets 
  FOR UPDATE 
  USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can delete their own datasets" 
  ON datasets 
  FOR DELETE 
  USING (auth.uid()::TEXT = user_id);

-- Create a function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(user_id_param TEXT)
RETURNS TABLE (
  total_datasets BIGINT,
  total_rows BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(id)::BIGINT AS total_datasets,
    COALESCE(SUM(row_count), 0)::BIGINT AS total_rows
  FROM
    datasets
  WHERE
    user_id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- Create a service role policy to bypass RLS for admin operations
CREATE POLICY "Service role can do anything" 
  ON datasets 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Service role can do anything with users" 
  ON users 
  USING (true) 
  WITH CHECK (true);
