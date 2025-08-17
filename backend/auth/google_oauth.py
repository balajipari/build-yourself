import os
import json
from typing import Optional, Dict, Any
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
import jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()


# Global configuration variables
def _get_config():
    """Get OAuth configuration from environment variables"""
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI")
    jwt_secret = os.getenv("JWT_SECRET", "your-secret-key")
    
    print("client_id", client_id)
    print("client_secret", client_secret)
    print("redirect_uri", redirect_uri)
    print("jwt_secret", jwt_secret)
    
    return client_id, client_secret, redirect_uri, jwt_secret

# Scopes for GSuite access
SCOPES = [
    'openid',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/admin.directory.user.readonly'
]
    
def get_authorization_url() -> str:
    """Generate Google OAuth authorization URL"""
    client_id, client_secret, redirect_uri, _ = _get_config()
    
    # Validate required parameters
    if not client_id or not client_secret or not redirect_uri:
        raise ValueError("Missing required OAuth configuration: client_id, client_secret, or redirect_uri")
    
    print(f"Creating OAuth flow with redirect_uri: {redirect_uri}")
    
    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": client_id,
                "client_secret": client_secret,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [redirect_uri]
            }
        },
        scopes=SCOPES
    )
    
    # Set the redirect URI explicitly
    flow.redirect_uri = redirect_uri
    
    authorization_url, _ = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent'  # Force consent screen to get refresh token
    )
    
    print(f"Generated authorization URL: {authorization_url}")
    return authorization_url
    
async def exchange_code_for_tokens(authorization_code: str) -> Dict[str, Any]:
    """Exchange authorization code for access and refresh tokens"""
    client_id, client_secret, redirect_uri, _ = _get_config()
    
    # Validate required parameters
    if not client_id or not client_secret or not redirect_uri:
        raise ValueError("Missing required OAuth configuration: client_id, client_secret, or redirect_uri")
    
    print(f"Exchanging code with redirect_uri: {redirect_uri}")
    
    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": client_id,
                "client_secret": client_secret,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [redirect_uri]
            }
        },
        scopes=SCOPES
    )
    
    # Set the redirect URI explicitly
    flow.redirect_uri = redirect_uri
    
    try:
        flow.fetch_token(code=authorization_code)
        print("Token exchange successful")
        
        # Log the actual scopes received
        if hasattr(flow.credentials, 'scopes'):
            print(f"Received scopes: {flow.credentials.scopes}")
        print(f"Expected scopes: {SCOPES}")
        
    except Exception as e:
        print(f"Token exchange failed: {e}")
        # If it's a scope mismatch, try to handle it gracefully
        if "Scope has changed" in str(e):
            print("Handling scope mismatch...")
            # Try to fetch token without strict scope validation
            try:
                flow.fetch_token(code=authorization_code, include_granted_scopes=True)
                print("Token exchange successful after scope handling")
            except Exception as retry_e:
                print(f"Retry failed: {retry_e}")
                raise retry_e
        else:
            raise
    
    # Get user info
    user_info = await get_user_info(flow.credentials)
    
    # Generate JWT token
    jwt_token = generate_jwt_token(user_info)
    
    return {
        "access_token": flow.credentials.token,
        "refresh_token": flow.credentials.refresh_token,
        "user_info": user_info,
        "jwt_token": jwt_token
    }
    
async def get_user_info(credentials: Credentials) -> Dict[str, Any]:
    """Get user information from Google"""
    service = build('oauth2', 'v2', credentials=credentials)
    user_info = service.userinfo().get().execute()
    
    # Check if user is from GSuite domain (optional)
    domain = user_info.get('hd', '')
    if domain and domain != 'gmail.com':
        # This is a GSuite user
        user_info['is_gsuite'] = True
        user_info['domain'] = domain
    else:
        user_info['is_gsuite'] = False
    
    return user_info
    
def generate_jwt_token(user_info: Dict[str, Any]) -> str:
    """Generate JWT token for the user"""
    _, _, _, jwt_secret = _get_config()
    
    payload = {
        "sub": user_info["id"],
        "email": user_info["email"],
        "name": user_info["name"],
        "picture": user_info.get("picture", ""),
        "is_gsuite": user_info.get("is_gsuite", False),
        "domain": user_info.get("domain", ""),
        "exp": datetime.utcnow() + timedelta(days=7),  # 7 days expiry
        "iat": datetime.utcnow()
    }
    
    return jwt.encode(payload, jwt_secret, algorithm="HS256")
    
def verify_jwt_token(token: str) -> Optional[Dict[str, Any]]:
    """Verify and decode JWT token"""
    _, _, _, jwt_secret = _get_config()
    
    try:
        payload = jwt.decode(token, jwt_secret, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
    
async def refresh_access_token(refresh_token: str) -> Optional[Dict[str, Any]]:
    """Refresh access token using refresh token"""
    client_id, client_secret, _, _ = _get_config()
    
    try:
        credentials = Credentials(
            token=None,
            refresh_token=refresh_token,
            client_id=client_id,
            client_secret=client_secret,
            token_uri="https://oauth2.googleapis.com/token"
        )
        
        if credentials.expired and credentials.refresh_token:
            credentials.refresh(Request())
            return {
                "access_token": credentials.token,
                "expires_at": credentials.expiry.isoformat() if credentials.expiry else None
            }
    except Exception as e:
        print(f"Error refreshing token: {e}")
        return None
    
    return None
