# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for the Build Yourself API with GSuite integration.

## Prerequisites

- Google Cloud Console account
- GSuite/Workspace account (for domain verification)
- Python 3.8+ with pip

## Step 1: Google Cloud Console Setup

### 1.1 Create a New Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: `build-yourself-api`
4. Click "Create"

### 1.2 Enable Google+ API
1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google+ API" and enable it
3. Search for "Admin SDK API" and enable it (for GSuite access)

### 1.3 Create OAuth 2.0 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Configure the OAuth consent screen:
   - User Type: External
   - App name: "Build Yourself API"
   - User support email: Your email
   - Developer contact information: Your email
   - Scopes: Add the following scopes:
     - `https://www.googleapis.com/auth/userinfo.profile`
     - `https://www.googleapis.com/auth/userinfo.email`
     - `https://www.googleapis.com/auth/admin.directory.user.readonly`

### 1.4 Create Web Application Credentials
1. Application type: Web application
2. Name: "Build Yourself API Web Client"
3. Authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (for development)
   - `https://yourdomain.com/auth/callback` (for production)
4. Click "Create"
5. **Save the Client ID and Client Secret** - you'll need these for environment variables

## Step 2: Environment Configuration

### 2.1 Create .env file
Copy `example.env` to `.env` and fill in the values:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_key_here

# Other configurations...
```

### 2.2 Generate JWT Secret
Generate a secure random string for JWT_SECRET:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

## Step 3: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

## Step 4: Test the Setup

### 4.1 Start the Backend
```bash
cd backend
uvicorn app:app --reload --host 0.0.0.0 --port 5000
```

### 4.2 Test OAuth Endpoints
1. **Get Auth URL**: `GET http://localhost:5000/auth/google/url`
2. **Test with Postman or curl**:
   ```bash
   curl http://localhost:5000/auth/google/url
   ```

## Step 5: Frontend Integration

### 5.1 Update Frontend Environment
Make sure your frontend is pointing to the correct backend URL:
```typescript
// frontend/src/config/api.ts
export const API_CONFIG = {
  BASE_URL: 'http://localhost:5000', // or your backend URL
  // ... other config
};
```

### 5.2 Test Complete Flow
1. Start frontend: `npm run dev`
2. Go to `/signin`
3. Click "Continue with Google"
4. Complete OAuth flow
5. Should redirect to `/dashboard`

## Troubleshooting

### Common Issues

#### 1. "redirect_uri_mismatch" Error
- Ensure the redirect URI in Google Cloud Console matches exactly
- Check for trailing slashes or protocol differences

#### 2. "invalid_client" Error
- Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct
- Check that credentials are for the right project

#### 3. CORS Issues
- Backend CORS is configured to allow all origins (`*`)
- For production, restrict to your frontend domain

#### 4. JWT Token Issues
- Ensure JWT_SECRET is set and consistent
- Check token expiration (default: 7 days)

### Debug Mode

Enable debug logging by setting:
```bash
LOG_LEVEL=DEBUG
```

## Production Considerations

### 1. Security
- Use HTTPS in production
- Restrict CORS origins to your domain
- Use strong JWT secrets
- Consider token refresh strategies

### 2. Domain Verification
- Verify your domain in Google Cloud Console
- Update redirect URIs for production domain
- Consider using Google Workspace for enterprise features

### 3. Rate Limiting
- Implement rate limiting for OAuth endpoints
- Monitor API usage in Google Cloud Console

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/google/url` | GET | Get Google OAuth authorization URL |
| `/auth/google/callback` | POST | Handle OAuth callback with code |
| `/auth/me` | GET | Get current user info (requires JWT) |
| `/auth/refresh` | POST | Refresh access token |
| `/auth/logout` | POST | Logout user |

## Testing with Postman

1. **Get Auth URL**:
   ```
   GET http://localhost:5000/auth/google/url
   ```

2. **Handle Callback** (after getting code from browser):
   ```
   POST http://localhost:5000/auth/google/callback
   Content-Type: application/json
   
   {
     "code": "authorization_code_from_google"
   }
   ```

3. **Get User Info**:
   ```
   GET http://localhost:5000/auth/me
   Authorization: Bearer <jwt_token>
   ```

## Support

If you encounter issues:
1. Check Google Cloud Console for API quotas and errors
2. Verify environment variables are set correctly
3. Check backend logs for detailed error messages
4. Ensure all required APIs are enabled in Google Cloud Console
