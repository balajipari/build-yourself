-- Migration: Fix enum values to match Python code
-- This migration ensures enum values are consistent between database and application

-- Check if there are any enum value mismatches
DO $$ 
BEGIN
    -- Update any users with incorrect status values
    UPDATE users 
    SET status = 'active'::user_status 
    WHERE status::text NOT IN ('active', 'inactive', 'suspended');
    
    -- Update any projects with incorrect status values  
    UPDATE projects 
    SET status = 'draft'::project_status 
    WHERE status::text NOT IN ('draft', 'in_progress', 'completed', 'archived');
    
    RAISE NOTICE 'Enum values have been normalized';
END $$;

-- Verify the enum values are correct
SELECT DISTINCT status FROM users;
SELECT DISTINCT status FROM projects;
