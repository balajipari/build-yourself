import os
from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import RedirectResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from app.dependencies import get_db
from .google_oauth import (
    _get_config, 
    get_authorization_url, 
    exchange_code_for_tokens, 
    verify_jwt_token, 
    refresh_access_token
)

router = APIRouter()
security = HTTPBearer()


@router.get("/ping")
def ping():
    _get_config()
    return {"message": "Auth module is alive!"}



class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    picture: Optional[str]
    is_gsuite: bool
    domain: Optional[str]

class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    user_info: UserResponse
    jwt_token: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

@router.get("/google/url")
async def get_google_auth_url():
    """Get Google OAuth authorization URL"""
    print("get_google_auth_url endpoint called")
    try:
        auth_url = get_authorization_url()
        print("Authorization URL generated successfully")
        return {"authorization_url": auth_url}
    except Exception as e:
        print(f"Error generating auth URL: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate auth URL: {str(e)}")

@router.get("/google/auth-url")
async def get_google_auth_url_for_frontend():
    """Get Google OAuth authorization URL for frontend integration"""
    try:
        auth_url = get_authorization_url()
        return {
            "success": True,
            "data": {
                "authorization_url": auth_url,
                "client_id": os.getenv("GOOGLE_CLIENT_ID"),
                "scopes": [
                    'openid',
                    'https://www.googleapis.com/auth/userinfo.profile',
                    'https://www.googleapis.com/auth/userinfo.email'
                ]
            }
        }
    except Exception as e:
        print(f"Error generating auth URL: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate auth URL: {str(e)}")

from fastapi.responses import RedirectResponse

@router.get("/callback")
async def google_oauth_callback(code: str, state: str = None, db: Session = Depends(get_db)):
    """Handle Google OAuth callback, create user, and redirect to frontend with tokens"""
    try:
        print(f"Received OAuth callback with code: {code[:10]}... and state: {state}")
        
        # Exchange code for tokens
        result = await exchange_code_for_tokens(code)
        
        # Create or get user from database
        from .google_oauth import create_or_get_user_from_google, generate_jwt_token_for_user
        user_data = await create_or_get_user_from_google(result['user_info'], db)
        
        print(f"User created/retrieved: {user_data['email']}")
        
        # Generate JWT token with user data from database
        jwt_token = generate_jwt_token_for_user(user_data)
        
        # Create redirect URL with complete auth data
        frontend_url = os.getenv("FRONTEND_CALLBACK_URL", "http://localhost:5173/auth/callback")
        redirect_url = f"{frontend_url}?jwt_token={jwt_token}&access_token={result['access_token']}&refresh_token={result['refresh_token']}&user_email={user_data['email']}&user_name={user_data['full_name']}&user_id={user_data['id']}&is_new_user={user_data['is_new_user']}"
        
        print(f"Redirecting to frontend with complete auth data")
        return RedirectResponse(url=redirect_url, status_code=302)
        
    except Exception as e:
        print(f"OAuth callback failed: {e}")
        # Redirect to frontend with error
        error_url = os.getenv("FRONTEND_SIGNIN_URL", "http://localhost:5173/signin") + "?error=auth_failed"
        return RedirectResponse(url=error_url, status_code=302)

@router.post("/google/callback")
async def google_oauth_callback_json(code: str, db: Session = Depends(get_db)):
    """Handle Google OAuth callback and create/get user, return JSON response"""
    try:
        print(f"Received OAuth callback with code: {code[:10]}...")
        
        # Exchange code for tokens
        result = await exchange_code_for_tokens(code)
        
        # Create or get user from database
        from .google_oauth import create_or_get_user_from_google, generate_jwt_token_for_user
        user_data = await create_or_get_user_from_google(result['user_info'], db)
        
        # Generate JWT token with user data from database
        jwt_token = generate_jwt_token_for_user(user_data)
        
        # Return complete auth response
        return {
            "success": True,
            "message": "Authentication successful",
            "data": {
                "jwt_token": jwt_token,
                "access_token": result['access_token'],
                "refresh_token": result['refresh_token'],
                "user": user_data
            }
        }
        
    except Exception as e:
        print(f"OAuth callback failed: {e}")
        raise HTTPException(
            status_code=400, 
            detail=f"Authentication failed: {str(e)}"
        )

@router.post("/google/complete")
async def complete_google_auth(code: str, db: Session = Depends(get_db)):
    """Complete Google OAuth flow: exchange code, create/get user, return tokens"""
    try:
        print(f"Completing Google OAuth with code: {code[:10]}...")
        
        # Exchange authorization code for tokens
        result = await exchange_code_for_tokens(code)
        
        # Create or get user from database
        from .google_oauth import create_or_get_user_from_google, generate_jwt_token_for_user
        user_data = await create_or_get_user_from_google(result['user_info'], db)
        
        print(f"User created/retrieved: {user_data['email']}")
        
        # Generate JWT token with user data from database
        jwt_token = generate_jwt_token_for_user(user_data)
        
        # Return complete auth response with tokens
        return {
            "success": True,
            "message": "Authentication successful",
            "data": {
                "jwt_token": jwt_token,
                "access_token": result['access_token'],
                "refresh_token": result['refresh_token'],
                "user": user_data,
                "expires_in": 604800,  # 7 days in seconds
                "token_type": "Bearer"
            }
        }
        
    except Exception as e:
        print(f"Google OAuth completion failed: {e}")
        raise HTTPException(
            status_code=400, 
            detail=f"Authentication failed: {str(e)}"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user information from JWT token"""
    try:
        payload = verify_jwt_token(credentials.credentials)
        if not payload:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        
        return UserResponse(
            id=payload["sub"],
            email=payload["email"],
            name=payload["name"],
            picture=payload.get("picture"),
            is_gsuite=payload.get("is_gsuite", False),
            domain=payload.get("domain")
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")

@router.post("/refresh")
async def refresh_token(request: RefreshTokenRequest):
    """Refresh access token using refresh token"""
    try:
        result = await refresh_access_token(request.refresh_token)
        if not result:
            raise HTTPException(status_code=400, detail="Failed to refresh token")
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Token refresh failed: {str(e)}")

@router.post("/validate")
async def validate_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Validate JWT token and return user info"""
    try:
        payload = verify_jwt_token(credentials.credentials)
        if not payload:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        
        return {
            "success": True,
            "message": "Token is valid",
            "data": {
                "user_id": payload["sub"],
                "email": payload["email"],
                "name": payload["name"],
                "expires_at": payload["exp"],
                "is_valid": True
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token validation failed: {str(e)}")

@router.post("/logout")
async def logout():
    """Logout user (client should clear tokens)"""
    return {"message": "Logged out successfully"}

@router.get("/user/profile/{user_id}")
async def get_user_profile(user_id: str, db: Session = Depends(get_db)):
    """Get user profile by ID"""
    try:
        from ..services.user_service import UserService
        user_service = UserService(db)
        
        user_profile = user_service.get_user_profile(user_id)
        if not user_profile:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "success": True,
            "data": user_profile
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user profile: {str(e)}")

@router.get("/user/check/{email}")
async def check_user_exists(email: str, db: Session = Depends(get_db)):
    """Check if user exists by email"""
    try:
        from ..services.user_service import UserService
        user_service = UserService(db)
        
        user = user_service.get_user_by_email(email)
        exists = user is not None
        
        return {
            "success": True,
            "data": {
                "email": email,
                "exists": exists,
                "user_id": str(user.id) if user else None
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to check user existence: {str(e)}")

@router.post("/user/onboarding")
async def complete_user_onboarding(
    user_id: str,
    full_name: str = None,
    db: Session = Depends(get_db)
):
    """Complete user onboarding for first-time users"""
    try:
        from ..services.user_service import UserService
        from ..schemas import UserUpdate
        
        user_service = UserService(db)
        
        # Get user to verify they exist
        user = user_service.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Only allow updating full name
        if not full_name:
            raise HTTPException(status_code=400, detail="Full name is required")
        
        # Create UserUpdate with full name
        update_data = UserUpdate(full_name=full_name)
        
        # Update user
        updated_user = user_service.update_user(user_id, update_data)
        if not updated_user:
            raise HTTPException(status_code=400, detail="Failed to update user")
        
        return {
            "success": True,
            "message": "User onboarding completed successfully",
            "data": {
                "user_id": str(updated_user.id),
                "full_name": updated_user.full_name,
                "email": updated_user.email
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to complete onboarding: {str(e)}")
