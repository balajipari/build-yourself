-- Migration: Remove username column from users table
-- Since email is unique and sufficient for user identification

-- Remove username column
ALTER TABLE users DROP COLUMN IF EXISTS username;

-- Remove any unique constraints on username if they exist
-- (This will fail gracefully if no such constraint exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'users_username_key' 
        AND table_name = 'users'
    ) THEN
        ALTER TABLE users DROP CONSTRAINT users_username_key;
    END IF;
END $$;
