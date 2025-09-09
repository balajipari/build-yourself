import os
from typing import Optional, Dict, Any
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
import jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

SCOPES = [
    'openid',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
]

def _get_config():
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI",)
    jwt_secret = os.getenv("JWT_SECRET", "your-secret-key")
    
    if not all([client_id, client_secret, redirect_uri]):
        raise ValueError("Missing required OAuth configuration")
    
    return client_id, client_secret, redirect_uri, jwt_secret

def _create_oauth_flow(redirect_uri: str) -> Flow:
    client_id, client_secret, _, _ = _get_config()
    
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
    flow.redirect_uri = redirect_uri
    return flow

def get_authorization_url() -> str:
    _, _, redirect_uri, _ = _get_config()
    
    flow = _create_oauth_flow(redirect_uri)
    authorization_url, _ = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent'
    )
    
    return authorization_url

def _handle_scope_mismatch(flow: Flow, code: str) -> bool:
    try:
        flow.fetch_token(code=code, include_granted_scopes=True)
        return True
    except Exception as e:
        print(f"Scope mismatch handling failed: {e}")
        return False

def _exchange_code(flow: Flow, code: str) -> bool:
    try:
        flow.fetch_token(code=code)
        return True
    except Exception as e:
        if "Scope has changed" in str(e):
            return _handle_scope_mismatch(flow, code)
        raise

async def exchange_code_for_tokens(authorization_code: str) -> Dict[str, Any]:
    _, _, redirect_uri, _ = _get_config()
    
    flow = _create_oauth_flow(redirect_uri)
    
    if not _exchange_code(flow, authorization_code):
        raise Exception("Failed to exchange authorization code")
    
    user_info = await get_user_info(flow.credentials)
    
    # Note: JWT token will be generated after user creation/retrieval
    # to include the database user ID
    
    return {
        "access_token": flow.credentials.token,
        "refresh_token": flow.credentials.refresh_token,
        "user_info": user_info
    }

async def create_or_get_user_from_google(user_info: Dict[str, Any], db_session) -> Dict[str, Any]:
    """Create or get user from Google OAuth info"""
    from ..services.user_service import UserService
    from ..schemas import UserCreate
    
    try:
        print(f"Starting user creation/retrieval for Google user: {user_info.get('email', 'unknown')}")
        
        # Validate required user info
        if not user_info.get("email"):
            raise Exception("Email is required from Google OAuth")
        if not user_info.get("id"):
            raise Exception("Google ID is required from OAuth")
        
        user_service = UserService(db_session)
        
        # Prepare user data from Google
        user_data = UserCreate(
            email=user_info["email"],
            full_name=user_info.get("name", ""),
            avatar_url=user_info.get("picture", ""),
            google_id=user_info["id"]
        )
        
        print(f"Prepared user data: email={user_data.email}, name={user_data.full_name}, google_id={user_data.google_id}")
        
        # Create or get existing user
        user = user_service.create_or_get_user(user_data)
        
        # Check if this is a new user
        is_new_user = user.created_at == user.updated_at
        
        print(f"User {'created' if is_new_user else 'retrieved'}: {user.email} (ID: {user.id})")
        
        # Return user info for response
        user_response = {
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "avatar_url": user.avatar_url,
            "status": user.status,
            "created_at": user.created_at.isoformat(),
            "updated_at": user.updated_at.isoformat(),
            "is_new_user": is_new_user,
            "google_id": user.google_id
        }
        
        print(f"User response prepared: {user_response}")
        return user_response
        
    except Exception as e:
        print(f"Error in create_or_get_user_from_google: {str(e)}")
        raise Exception(f"Failed to create or get user: {str(e)}")

async def get_user_info(credentials: Credentials) -> Dict[str, Any]:
    service = build('oauth2', 'v2', credentials=credentials)
    user_info = service.userinfo().get().execute()
    
    domain = user_info.get('hd', '')
    user_info['is_gsuite'] = domain and domain != 'gmail.com'
    user_info['domain'] = domain
    
    return user_info

def generate_jwt_token(user_info: Dict[str, Any]) -> str:
    _, _, _, jwt_secret = _get_config()
    
    payload = {
        "sub": user_info["id"],
        "email": user_info["email"],
        "name": user_info["name"],
        "picture": user_info.get("picture", ""),
        "is_gsuite": user_info.get("is_gsuite", False),
        "domain": user_info.get("domain", ""),
        "exp": datetime.utcnow() + timedelta(days=7),
        "iat": datetime.utcnow()
    }
    
    return jwt.encode(payload, jwt_secret, algorithm="HS256")

def generate_jwt_token_for_user(user_data: Dict[str, Any]) -> str:
    """Generate JWT token for user data from database"""
    _, _, _, jwt_secret = _get_config()
    
    payload = {
        "sub": user_data["id"],  # Database user ID
        "email": user_data["email"],
        "name": user_data["full_name"],
        "picture": user_data.get("avatar_url", ""),
        "is_new_user": user_data.get("is_new_user", False),
        "exp": datetime.utcnow() + timedelta(days=7),
        "iat": datetime.utcnow()
    }
    
    return jwt.encode(payload, jwt_secret, algorithm="HS256")

def verify_jwt_token(token: str) -> Optional[Dict[str, Any]]:
    _, _, _, jwt_secret = _get_config()
    
    try:
        return jwt.decode(token, jwt_secret, algorithms=["HS256"])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None

async def refresh_access_token(refresh_token: str) -> Optional[Dict[str, Any]]:
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
        print(f"Token refresh failed: {e}")
    
    return None
