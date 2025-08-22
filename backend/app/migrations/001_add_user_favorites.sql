-- Migration: Add user_favorites table and update existing schema
-- This migration adds support for user favorites and ensures proper indexing

-- Create user_favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create unique constraint to prevent duplicate favorites
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_favorites_unique 
ON user_favorites(user_id, project_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_project_id ON user_favorites(project_id);

-- Add any missing columns to existing tables if they don't exist
DO $$ 
BEGIN
    -- Add google_id column to users if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'google_id') THEN
        ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE;
    END IF;
    
    -- Add avatar_url column to users if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'avatar_url') THEN
        ALTER TABLE users ADD COLUMN avatar_url TEXT;
    END IF;
    
    -- Add configuration column to projects if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'projects' AND column_name = 'configuration') THEN
        ALTER TABLE projects ADD COLUMN configuration JSONB;
    END IF;
END $$;

-- Grant permissions to the new table
GRANT ALL PRIVILEGES ON TABLE user_favorites TO builduser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO builduser;
