"""
Redis-based Session Manager for Build Yourself API
Handles user sessions with automatic expiration and efficient storage
"""

import json
import uuid
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import redis
from fastapi import HTTPException, status


class RedisSessionManager:
    """Manages user sessions using Redis with automatic expiration"""
    
    def __init__(self, redis_client: redis.Redis, session_ttl: int = 3600):
        """
        Initialize session manager
        
        Args:
            redis_client: Redis client instance
            session_ttl: Session time-to-live in seconds (default: 1 hour)
        """
        self.redis = redis_client
        self.session_ttl = session_ttl
        self.session_prefix = "session:"
        self.user_sessions_prefix = "user_sessions:"
    
    def create_session(self, user_id: str, user_data: Dict[str, Any]) -> str:
        """
        Create a new session for a user
        
        Args:
            user_id: User's unique identifier
            user_data: User data to store in session
            
        Returns:
            Session ID string
        """
        session_id = str(uuid.uuid4())
        session_key = f"{self.session_prefix}{session_id}"
        user_sessions_key = f"{self.user_sessions_prefix}{user_id}"
        
        # Store session data
        session_data = {
            "user_id": user_id,
            "user_data": user_data,
            "created_at": datetime.utcnow().isoformat(),
            "last_accessed": datetime.utcnow().isoformat()
        }
        
        # Store session in Redis with TTL
        self.redis.setex(
            session_key,
            self.session_ttl,
            json.dumps(session_data)
        )
        
        # Track user's active sessions
        self.redis.sadd(user_sessions_key, session_id)
        self.redis.expire(user_sessions_key, self.session_ttl)
        
        return session_id
    
    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve session data by session ID
        
        Args:
            session_id: Session identifier
            
        Returns:
            Session data dictionary or None if not found/expired
        """
        session_key = f"{self.session_prefix}{session_id}"
        session_data = self.redis.get(session_key)
        
        if not session_data:
            return None
        
        # Parse session data
        session = json.loads(session_data)
        
        # Update last accessed time
        session["last_accessed"] = datetime.utcnow().isoformat()
        
        # Extend session TTL
        self.redis.setex(
            session_key,
            self.session_ttl,
            json.dumps(session)
        )
        
        return session
    
    def update_session(self, session_id: str, updates: Dict[str, Any]) -> bool:
        """
        Update session data
        
        Args:
            session_id: Session identifier
            updates: Data to update in session
            
        Returns:
            True if successful, False if session not found
        """
        session_key = f"{self.session_prefix}{session_id}"
        session_data = self.redis.get(session_key)
        
        if not session_data:
            return False
        
        # Parse existing session
        session = json.loads(session_data)
        
        # Update with new data
        session.update(updates)
        session["last_accessed"] = datetime.utcnow().isoformat()
        
        # Store updated session
        self.redis.setex(
            session_key,
            self.session_ttl,
            json.dumps(session)
        )
        
        return True
    
    def delete_session(self, session_id: str) -> bool:
        """
        Delete a specific session
        
        Args:
            session_id: Session identifier
            
        Returns:
            True if successful, False if session not found
        """
        session_key = f"{self.session_prefix}{session_id}"
        session_data = self.redis.get(session_key)
        
        if not session_data:
            return False
        
        # Get user ID from session
        session = json.loads(session_data)
        user_id = session.get("user_id")
        
        # Remove session
        self.redis.delete(session_key)
        
        # Remove from user's active sessions
        if user_id:
            user_sessions_key = f"{self.user_sessions_prefix}{user_id}"
            self.redis.srem(user_sessions_key, session_id)
        
        return True
    
    def delete_user_sessions(self, user_id: str) -> int:
        """
        Delete all sessions for a specific user
        
        Args:
            user_id: User identifier
            
        Returns:
            Number of sessions deleted
        """
        user_sessions_key = f"{self.user_sessions_prefix}{user_id}"
        session_ids = self.redis.smembers(user_sessions_key)
        
        if not session_ids:
            return 0
        
        # Delete all sessions
        deleted_count = 0
        for session_id in session_ids:
            session_key = f"{self.session_prefix}{session_id.decode()}"
            if self.redis.delete(session_key):
                deleted_count += 1
        
        # Remove user sessions tracking
        self.redis.delete(user_sessions_key)
        
        return deleted_count
    
    def extend_session(self, session_id: str, additional_ttl: int = 3600) -> bool:
        """
        Extend session TTL
        
        Args:
            session_id: Session identifier
            additional_ttl: Additional time in seconds
            
        Returns:
            True if successful, False if session not found
        """
        session_key = f"{self.session_prefix}{session_id}"
        session_data = self.redis.get(session_key)
        
        if not session_data:
            return False
        
        # Get current TTL
        current_ttl = self.redis.ttl(session_key)
        if current_ttl <= 0:
            return False
        
        # Extend TTL
        new_ttl = current_ttl + additional_ttl
        self.redis.expire(session_key, new_ttl)
        
        # Update last accessed time
        session = json.loads(session_data)
        session["last_accessed"] = datetime.utcnow().isoformat()
        self.redis.setex(
            session_key,
            new_ttl,
            json.dumps(session)
        )
        
        return True
    
    def get_user_active_sessions(self, user_id: str) -> list:
        """
        Get all active sessions for a user
        
        Args:
            user_id: User identifier
            
        Returns:
            List of active session IDs
        """
        user_sessions_key = f"{self.user_sessions_prefix}{user_id}"
        session_ids = self.redis.smembers(user_sessions_key)
        
        active_sessions = []
        for session_id in session_ids:
            session_key = f"{self.session_prefix}{session_id.decode()}"
            if self.redis.exists(session_key):
                active_sessions.append(session_id.decode())
        
        return active_sessions
    
    def cleanup_expired_sessions(self) -> int:
        """
        Clean up expired sessions (Redis handles this automatically with TTL)
        This method can be used for additional cleanup if needed
        
        Returns:
            Number of sessions cleaned up
        """
        # Redis automatically removes expired keys
        # This method can be extended for additional cleanup logic
        return 0
    
    def get_session_stats(self) -> Dict[str, Any]:
        """
        Get session statistics
        
        Returns:
            Dictionary with session statistics
        """
        # Count total sessions
        session_keys = self.redis.keys(f"{self.session_prefix}*")
        total_sessions = len(session_keys)
        
        # Count total users with sessions
        user_session_keys = self.redis.keys(f"{self.user_sessions_prefix}*")
        total_users = len(user_session_keys)
        
        return {
            "total_sessions": total_sessions,
            "total_users_with_sessions": total_users,
            "session_ttl_seconds": self.session_ttl
        }


# Factory function to create session manager
def create_session_manager(redis_url: str, session_ttl: int = 3600) -> RedisSessionManager:
    """
    Create a session manager instance
    
    Args:
        redis_url: Redis connection URL
        session_ttl: Session time-to-live in seconds
        
    Returns:
        RedisSessionManager instance
    """
    try:
        redis_client = redis.from_url(redis_url, decode_responses=True)
        # Test connection
        redis_client.ping()
        return RedisSessionManager(redis_client, session_ttl)
    except redis.ConnectionError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Redis connection failed: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create session manager: {str(e)}"
        )
