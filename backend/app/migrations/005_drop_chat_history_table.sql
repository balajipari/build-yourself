-- Migration: Drop chat_history table
-- This migration removes the chat_history table as it's not needed for MVP
-- Chat history is now stored in the projects.conversation_history JSONB field

-- Drop the chat_history table and all its data
DROP TABLE IF EXISTS chat_history CASCADE;

-- Note: The conversation_history column in the projects table remains
-- This provides all the chat history functionality needed for the MVP
