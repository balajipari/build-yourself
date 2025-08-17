from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
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

@router.get("/callback", response_model=AuthResponse)
async def google_oauth_callback(code: str, state: str = None):
    """Handle Google OAuth callback with authorization code from query parameters"""
    try:
        print(f"Received OAuth callback with code: {code[:10]}... and state: {state}")
        result = await exchange_code_for_tokens(code)
        return AuthResponse(**result)
    except Exception as e:
        print(f"OAuth callback failed: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to exchange code: {str(e)}")

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

@router.post("/logout")
async def logout():
    """Logout user (client should clear tokens)"""
    return {"message": "Logged out successfully"}
