# 🔐 Google OAuth Authentication Flow

This document explains the complete Google OAuth implementation for the Build Yourself API.

## 📋 Overview

The authentication system implements a complete OAuth 2.0 flow with Google, including:
- User creation/retrieval from database
- JWT token generation and management
- Token refresh and validation
- Secure user sessions

## 🚀 Complete OAuth Flow

### 1. Get Authorization URL
**Endpoint:** `GET /auth/google/auth-url`

**Response:**
```json
{
  "success": true,
  "data": {
    "authorization_url": "https://accounts.google.com/o/oauth2/auth?...",
    "client_id": "your-google-client-id",
    "scopes": [
      "openid",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email"
    ]
  }
}
```

### 2. Complete OAuth Flow
**Endpoint:** `POST /auth/google/complete`

**Request Body:**
```json
{
  "code": "authorization_code_from_google"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Authentication successful",
  "data": {
    "jwt_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "access_token": "ya29.a0AfH6SMC...",
    "refresh_token": "1//04dX...",
    "user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "full_name": "John Doe",
      "avatar_url": "https://...",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    },
    "expires_in": 604800,
    "token_type": "Bearer"
  }
}
```

## 🔑 Token Management

### JWT Token Structure
```json
{
  "sub": "google_user_id",
  "email": "user@example.com",
  "name": "John Doe",
  "picture": "https://...",
  "is_gsuite": false,
  "domain": "gmail.com",
  "exp": 1704067200,
  "iat": 1703462400
}
```

### Token Validation
**Endpoint:** `POST /auth/validate`

**Headers:** `Authorization: Bearer <jwt_token>`

**Response:**
```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "user_id": "google_user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "expires_at": 1704067200,
    "is_valid": true
  }
}
```

### Token Refresh
**Endpoint:** `POST /auth/refresh`

**Request Body:**
```json
{
  "refresh_token": "1//04dX..."
}
```

**Response:**
```json
{
  "access_token": "ya29.a0AfH6SMC...",
  "expires_at": "2024-01-08T00:00:00Z"
}
```

## 👤 User Management

### Get Current User
**Endpoint:** `GET /auth/me`

**Headers:** `Authorization: Bearer <jwt_token>`

**Response:**
```json
{
  "id": "uuid-string",
  "email": "user@example.com",
  "username": null,
  "full_name": "John Doe",
  "avatar_url": "https://...",
  "google_id": "google_user_id"
}
```

### Logout
**Endpoint:** `POST /auth/logout`

**Headers:** `Authorization: Bearer <jwt_token>`

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

## 🌐 Frontend Integration

### 1. Start OAuth Flow
```javascript
// Get authorization URL
const response = await fetch('/auth/google/auth-url');
const { data } = await response.json();

// Redirect user to Google
window.location.href = data.authorization_url;
```

### 2. Handle OAuth Callback
```javascript
// Get authorization code from URL
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');

if (code) {
  // Complete OAuth flow
  const response = await fetch('/auth/google/complete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code })
  });
  
  const result = await response.json();
  
  if (result.success) {
    // Store tokens
    localStorage.setItem('jwt_token', result.data.jwt_token);
    localStorage.setItem('refresh_token', result.data.refresh_token);
    localStorage.setItem('user', JSON.stringify(result.data.user));
    
    // Redirect to dashboard
    window.location.href = '/dashboard';
  }
}
```

### 3. Make Authenticated Requests
```javascript
// Include JWT token in all API requests
const token = localStorage.getItem('jwt_token');

const response = await fetch('/api/protected-endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### 4. Handle Token Expiration
```javascript
// Check if token is expired
const validateToken = async () => {
  try {
    const response = await fetch('/auth/validate', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
      }
    });
    
    if (!response.ok) {
      // Token expired, try to refresh
      await refreshToken();
    }
  } catch (error) {
    // Redirect to login
    window.location.href = '/login';
  }
};

// Refresh token
const refreshToken = async () => {
  try {
    const response = await fetch('/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        refresh_token: localStorage.getItem('refresh_token')
      })
    });
    
    const result = await response.json();
    
    if (result.access_token) {
      localStorage.setItem('jwt_token', result.access_token);
    } else {
      // Refresh failed, redirect to login
      window.location.href = '/login';
    }
  } catch (error) {
    // Redirect to login
    window.location.href = '/login';
  }
};
```

## 🔒 Security Features

- **JWT Tokens**: Secure, stateless authentication
- **Token Expiration**: 7-day expiration with refresh capability
- **HTTPS Only**: All endpoints require secure connections
- **User Validation**: Database-backed user management
- **Session Management**: Redis-based session storage

## ⚙️ Environment Variables

```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/callback
JWT_SECRET=your_jwt_secret_key
FRONTEND_CALLBACK_URL=http://localhost:5173/auth/callback
FRONTEND_SIGNIN_URL=http://localhost:5173/signin
```

## 🚨 Error Handling

All endpoints return consistent error responses:

```json
{
  "detail": "Error message description"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request (invalid code, missing parameters)
- `401`: Unauthorized (invalid/expired token)
- `500`: Internal Server Error

## 📝 Database Schema

Users are automatically created in the database with:
- `id`: UUID primary key
- `email`: Google email address
- `full_name`: Google display name
- `avatar_url`: Google profile picture
- `google_id`: Google OAuth ID
- `status`: User status (active/inactive)
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp
