"""
Dependencies for FastAPI application
Provides dependency injection for database, Redis, and session management
"""

from typing import Generator, Optional
import os
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from redis import Redis
from .session_manager import create_session_manager, RedisSessionManager

# Security
security = HTTPBearer()

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://builduser:buildpass123@postgres:5432/build_yourself")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Redis
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379")
redis_client = Redis.from_url(REDIS_URL, decode_responses=True)

# Session TTL (1 hour default)
SESSION_TTL = int(os.getenv("SESSION_TTL", "3600"))


def get_db() -> Generator[Session, None, None]:
    """Database session dependency"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_redis() -> Redis:
    """Redis client dependency"""
    try:
        redis_client.ping()
        return redis_client
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Redis connection failed: {str(e)}"
        )


def get_session_manager() -> RedisSessionManager:
    """Session manager dependency"""
    return create_session_manager(REDIS_URL, SESSION_TTL)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session_manager: RedisSessionManager = Depends(get_session_manager)
) -> Optional[dict]:
    """
    Get current authenticated user from session
    
    Args:
        credentials: HTTP Bearer token
        session_manager: Redis session manager
        
    Returns:
        User data dictionary or None if not authenticated
    """
    try:
        session_id = credentials.credentials
        session = session_manager.get_session(session_id)
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired session"
            )
        
        return session.get("user_data")
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}"
        )


def get_current_user_jwt(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    Get current authenticated user from JWT token
    
    Args:
        credentials: HTTP Bearer token
        
    Returns:
        User data dictionary from JWT payload
    """
    try:
        from .auth.google_oauth import verify_jwt_token
        
        payload = verify_jwt_token(credentials.credentials)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )
        
        return {
            "id": payload["sub"],
            "email": payload["email"],
            "name": payload.get("name", ""),
            "picture": payload.get("picture", ""),
            "is_gsuite": payload.get("is_gsuite", False),
            "domain": payload.get("domain", "")
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}"
        )


def get_optional_user(
    request: Request,
    session_manager: RedisSessionManager = Depends(get_session_manager)
) -> Optional[dict]:
    """
    Get current user if authenticated, otherwise return None
    Useful for endpoints that work with or without authentication
    
    Args:
        request: FastAPI request object
        session_manager: Redis session manager
        
    Returns:
        User data dictionary or None if not authenticated
    """
    try:
        # Check for Authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return None
        
        session_id = auth_header.split(" ")[1]
        session = session_manager.get_session(session_id)
        
        if not session:
            return None
        
        return session.get("user_data")
    
    except Exception:
        return None


def require_auth(user: dict = Depends(get_current_user)) -> dict:
    """
    Require authentication for protected endpoints
    
    Args:
        user: Current user data from get_current_user
        
    Returns:
        User data dictionary
        
    Raises:
        HTTPException: If user is not authenticated
    """
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    return user


def require_admin(user: dict = Depends(require_auth)) -> dict:
    """
    Require admin privileges
    
    Args:
        user: Current user data from require_auth
        
    Returns:
        User data dictionary
        
    Raises:
        HTTPException: If user is not admin
    """
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return user


# Health check dependencies
def check_database_health() -> dict:
    """Check database connection health"""
    try:
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        return {"status": "healthy", "service": "database"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database health check failed: {str(e)}"
        )


def check_redis_health() -> dict:
    """Check Redis connection health"""
    try:
        redis_client.ping()
        return {"status": "healthy", "service": "redis"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Redis health check failed: {str(e)}"
        )


def check_session_manager_health() -> dict:
    """Check session manager health"""
    try:
        session_manager = get_session_manager()
        stats = session_manager.get_session_stats()
        return {"status": "healthy", "service": "session_manager", "stats": stats}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Session manager health check failed: {str(e)}"
        )
