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
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/admin.directory.user.readonly'
]

def _get_config():
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI")
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
    jwt_token = generate_jwt_token(user_info)
    
    return {
        "access_token": flow.credentials.token,
        "refresh_token": flow.credentials.refresh_token,
        "user_info": user_info,
        "jwt_token": jwt_token
    }

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
