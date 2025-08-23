-- Migration: Fix image_base64 column to handle large images
-- This migration removes the index on image_base64 and ensures it can handle large text

-- Drop the index on image_base64 since it's causing issues with large images
DROP INDEX IF EXISTS idx_projects_image_base64;

-- Alter the column to use TEXT type explicitly
ALTER TABLE projects ALTER COLUMN image_base64 TYPE TEXT;

-- Grant permissions
GRANT ALL PRIVILEGES ON TABLE projects TO builduser;
