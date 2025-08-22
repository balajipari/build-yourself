-- Migration: Add image_base64 and conversation_history columns to projects table
-- This migration adds support for storing generated images and chat conversations

-- Add image_base64 column to projects table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'projects' AND column_name = 'image_base64') THEN
        ALTER TABLE projects ADD COLUMN image_base64 TEXT;
    END IF;
END $$;

-- Add conversation_history column to projects table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'projects' AND column_name = 'conversation_history') THEN
        ALTER TABLE projects ADD COLUMN conversation_history JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Create index on image_base64 for better performance when querying projects with images
CREATE INDEX IF NOT EXISTS idx_projects_image_base64 ON projects(image_base64) WHERE image_base64 IS NOT NULL;

-- Create index on conversation_history for better performance when querying projects with conversations
CREATE INDEX IF NOT EXISTS idx_projects_conversation_history ON projects USING GIN(conversation_history) WHERE conversation_history IS NOT NULL;

-- Grant permissions to the updated table
GRANT ALL PRIVILEGES ON TABLE projects TO builduser;
