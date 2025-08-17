"""
Session-based authentication endpoints using Redis
Demonstrates Redis session management for user authentication
"""

from fastapi import APIRouter, Depends, HTTPException, status, Response
from pydantic import BaseModel
from typing import Optional
from ..dependencies import get_session_manager, get_current_user, get_optional_user
from ..session_manager import RedisSessionManager

router = APIRouter()

# Pydantic models
class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    session_id: str
    user_data: dict
    expires_in: int

class SessionInfo(BaseModel):
    session_id: str
    user_data: dict
    created_at: str
    last_accessed: str
    expires_in: int

class LogoutResponse(BaseModel):
    message: str
    session_deleted: bool


@router.post("/login", response_model=LoginResponse)
async def login(
    login_data: LoginRequest,
    session_manager: RedisSessionManager = Depends(get_session_manager)
):
    """
    User login endpoint
    
    Creates a new session in Redis for authenticated users
    """
    try:
        # TODO: Implement actual user authentication logic
        # For now, we'll simulate a successful login
        
        # Simulate user lookup and password verification
        if login_data.email == "test@example.com" and login_data.password == "password":
            user_data = {
                "id": "user_123",
                "email": login_data.email,
                "username": "testuser",
                "full_name": "Test User",
                "role": "user"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Create session in Redis
        session_id = session_manager.create_session(
            user_id=user_data["id"],
            user_data=user_data
        )
        
        return LoginResponse(
            session_id=session_id,
            user_data=user_data,
            expires_in=session_manager.session_ttl
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )


@router.post("/logout", response_model=LogoutResponse)
async def logout(
    response: Response,
    current_user: dict = Depends(get_current_user),
    session_manager: RedisSessionManager = Depends(get_session_manager)
):
    """
    User logout endpoint
    
    Deletes the current session from Redis
    """
    try:
        # Get session ID from Authorization header
        # This would typically be extracted from the request context
        # For now, we'll require the session ID in the request body
        
        # TODO: Extract session ID from request context or token
        # For demonstration, we'll delete all sessions for the user
        
        deleted_count = session_manager.delete_user_sessions(current_user["id"])
        
        # Clear the session cookie/token
        response.delete_cookie("session_id")
        
        return LogoutResponse(
            message="Successfully logged out",
            session_deleted=deleted_count > 0
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Logout failed: {str(e)}"
        )


@router.get("/me", response_model=dict)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """
    Get current user information
    
    Returns user data from the current session
    """
    return current_user


@router.get("/session/info", response_model=SessionInfo)
async def get_session_info(
    session_id: str,
    session_manager: RedisSessionManager = Depends(get_session_manager)
):
    """
    Get session information
    
    Returns detailed information about a specific session
    """
    session = session_manager.get_session(session_id)
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found or expired"
        )
    
    # Get TTL for the session
    session_key = f"session:{session_id}"
    ttl = session_manager.redis.ttl(session_key)
    
    return SessionInfo(
        session_id=session_id,
        user_data=session["user_data"],
        created_at=session["created_at"],
        last_accessed=session["last_accessed"],
        expires_in=ttl
    )


@router.post("/session/extend")
async def extend_session(
    session_id: str,
    additional_hours: int = 1,
    session_manager: RedisSessionManager = Depends(get_session_manager)
):
    """
    Extend session TTL
    
    Extends the session expiration time
    """
    additional_ttl = additional_hours * 3600  # Convert hours to seconds
    
    success = session_manager.extend_session(session_id, additional_ttl)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found or expired"
        )
    
    return {
        "message": f"Session extended by {additional_hours} hour(s)",
        "session_id": session_id,
        "additional_ttl": additional_ttl
    }


@router.delete("/session/{session_id}")
async def delete_session(
    session_id: str,
    session_manager: RedisSessionManager = Depends(get_session_manager)
):
    """
    Delete a specific session
    
    Useful for admin operations or user logout from specific device
    """
    success = session_manager.delete_session(session_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    return {
        "message": "Session deleted successfully",
        "session_id": session_id
    }


@router.get("/sessions/active")
async def get_active_sessions(
    current_user: dict = Depends(get_current_user),
    session_manager: RedisSessionManager = Depends(get_session_manager)
):
    """
    Get all active sessions for the current user
    
    Useful for showing user's active sessions across devices
    """
    active_sessions = session_manager.get_user_active_sessions(current_user["id"])
    
    return {
        "user_id": current_user["id"],
        "active_sessions": active_sessions,
        "total_sessions": len(active_sessions)
    }


@router.get("/health/sessions")
async def get_session_health(
    session_manager: RedisSessionManager = Depends(get_session_manager)
):
    """
    Get session manager health and statistics
    
    Useful for monitoring session system health
    """
    try:
        stats = session_manager.get_session_stats()
        return {
            "status": "healthy",
            "service": "session_manager",
            "stats": stats
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "service": "session_manager",
            "error": str(e)
        }
