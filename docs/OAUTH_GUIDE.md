# Google OAuth 2.0 Complete Guide

## Table of Contents
1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Implementation Details](#implementation-details)
4. [Security Features](#security-features)
5. [Flow Diagrams](#flow-diagrams)
6. [Troubleshooting](#troubleshooting)

---

## Overview

The application implements **OAuth 2.0 Authorization Code flow with PKCE** for secure Google authentication. This approach provides:

✅ **Gmail API Access** - Read, send, and manage emails  
✅ **Background Sync** - Backend can sync emails without user interaction  
✅ **Refresh Tokens** - Long-lived access (no re-authentication needed)  
✅ **Maximum Security** - Client secret protected, PKCE prevents code interception  
✅ **User Control** - Backend manages all tokens securely

### Why This Approach?

Your backend uses Authorization Code flow (not simple ID token) because the application needs:
- **Gmail API access** for email operations
- **Refresh tokens** for background email synchronization
- **Server-side token exchange** for maximum security
- **Encrypted token storage** for Google credentials

**Simple ID Token approach won't work** because it only provides user authentication without API access or refresh tokens.

---

## Quick Start

### Prerequisites

- Google Cloud project with OAuth 2.0 credentials
- Gmail API enabled
- Frontend and backend running

### 5-Minute Setup

#### 1. Configure Google Cloud Console

1. Go to https://console.cloud.google.com/apis/credentials
2. Find OAuth client ID:
3. Click **Edit**
4. Add authorized redirect URIs:
   ```
   http://localhost:5173/auth/callback
   ```
5. Click **Save**

#### 2. Enable Gmail API

1. Go to https://console.cloud.google.com/apis/library
2. Search **"Gmail API"**
3. Click **Enable**

#### 3. Configure OAuth Consent Screen

1. Go to OAuth consent screen
2. Add scopes:
   - `openid`
   - `email`
   - `profile`
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/gmail.modify`

#### 4. Environment Variables

**Frontend (.env):**
```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback
VITE_API_BASE_URL=http://localhost:3000/v1
```

**Backend (.env):**
```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

#### 5. Test OAuth Flow

1. Start backend: `cd tldr-backend && npm run start:dev`
2. Start frontend: `cd Ga03 && npm run dev`
3. Go to http://localhost:5173/login
4. Click **"Sign in with Google"**
5. Approve permissions on Google consent screen
6. Should redirect back and login successfully ✅

---

## Implementation Details

### Architecture

The OAuth implementation consists of:

**Frontend Files:**
- `src/utils/oauth.ts` - PKCE utilities and OAuth URL builder
- `src/pages/OAuthCallback.tsx` - Handles redirect from Google
- `src/services/authApi.ts` - Initiates OAuth flow
- `src/hooks/useAuth.ts` - React Query mutations for OAuth
- `src/pages/Login.tsx` - Custom OAuth button

**Backend (Already Implemented):**
- `src/modules/auth/strategies/google-oauth.strategy.ts` - OAuth logic
- `src/modules/auth/auth.controller.ts` - POST /v1/auth/google endpoint
- `src/modules/auth/auth.service.ts` - User creation and token management

### Complete OAuth Flow

```
┌──────────┐                 ┌──────────┐                 ┌──────────┐
│ Frontend │                 │ Backend  │                 │  Google  │
└────┬─────┘                 └────┬─────┘                 └────┬─────┘
     │                            │                            │
     │ 1. User clicks "Sign in with Google"                   │
     │─────────────────────────────────────────────────────────>
     │                                                          │
     │ 2. Generate PKCE parameters:                            │
     │    - code_verifier (random string)                      │
     │    - code_challenge = SHA256(verifier)                  │
     │    - state (CSRF protection)                            │
     │                                                          │
     │ 3. Redirect to Google OAuth URL                         │
     │    with code_challenge and state                        │
     │─────────────────────────────────────────────────────────>
     │                                                          │
     │                 4. User approves on Google consent      │
     │<─────────────────────────────────────────────────────────
     │                                                          │
     │ 5. Google redirects with authorization code             │
     │    /auth/callback?code=ABC&state=XYZ                    │
     │<─────────────────────────────────────────────────────────
     │                                                          │
     │ 6. Validate state, extract code                         │
     │                                                          │
     │ 7. Send code + verifier to backend                      │
     │    POST /v1/auth/google                                 │
     │    { code, codeVerifier }                               │
     │──────────────────────────>│                             │
     │                            │                             │
     │                            │ 8. Exchange code for tokens │
     │                            │    POST /token              │
     │                            │    { code, verifier, secret }
     │                            │────────────────────────────>│
     │                            │                             │
     │                            │ 9. Returns tokens:          │
     │                            │    - access_token (1hr)     │
     │                            │    - refresh_token (forever)│
     │                            │    - id_token (user info)   │
     │                            │<────────────────────────────│
     │                            │                             │
     │                            │ 10. Create/update user      │
     │                            │     Store Google tokens     │
     │                            │     Generate app tokens     │
     │                            │                             │
     │ 11. Return app tokens      │                             │
     │    { accessToken, refreshToken }                        │
     │<───────────────────────────│                             │
     │                            │                             │
     │ 12. Store tokens, redirect │                             │
     │     to /inbox              │                             │
     │                            │                             │
```

### Step-by-Step Process

#### Step 1-3: Frontend Initiates OAuth

When user clicks "Sign in with Google":

```typescript
// src/services/authApi.ts - initiateGoogleOAuth()

// 1. Generate PKCE code verifier (43-128 random characters)
const codeVerifier = generateCodeVerifier();
// Example: "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"

// 2. Generate code challenge (SHA256 hash of verifier)
const codeChallenge = await generateCodeChallenge(codeVerifier);
// Example: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM"

// 3. Generate random state for CSRF protection
const state = generateState();
// Example: "xcoiv98y3md22vwsuye3kch"

// 4. Store verifier and state in sessionStorage
storeOAuthState(codeVerifier, state);

// 5. Build Google OAuth URL
const url = buildGoogleOAuthUrl(codeChallenge, state);
// https://accounts.google.com/o/oauth2/v2/auth?
//   client_id=80455850361-...
//   redirect_uri=http://localhost:5173/auth/callback
//   response_type=code
//   scope=openid email profile gmail.readonly gmail.modify
//   code_challenge=E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM
//   code_challenge_method=S256
//   state=xcoiv98y3md22vwsuye3kch
//   access_type=offline
//   prompt=consent

// 6. Redirect user to Google
window.location.href = url;
```

**Why PKCE?**
- **Problem**: Malicious app could intercept authorization code
- **Solution**: Even with code, attacker can't use it without the original `code_verifier`
- **Protection**: `code_challenge` sent to Google, `code_verifier` sent to backend
- **Result**: Only the app that started OAuth can complete it

#### Step 4-5: User Approves on Google

User sees Google consent screen asking for:
- View email address
- View basic profile info
- Read Gmail messages
- Modify Gmail messages

After approval, Google redirects:
```
http://localhost:5173/auth/callback?
  code=4/0AY0e-g7XYZ_authorization_code&
  state=xcoiv98y3md22vwsuye3kch
```

#### Step 6-7: Frontend Sends Code to Backend

```typescript
// src/pages/OAuthCallback.tsx

useEffect(() => {
  async function handleCallback() {
    // 1. Extract code and state from URL
    const { code, state } = extractOAuthParams(window.location.href);
    
    // 2. Validate state (CSRF protection)
    const { codeVerifier } = retrieveAndValidateOAuthState(state);
    // Throws error if state doesn't match
    
    // 3. Send to backend
    const response = await googleLoginMutation.mutateAsync({
      code: code,
      codeVerifier: codeVerifier
    });
    
    // 4. Store tokens
    setAccessToken(response.tokens.accessToken);
    setRefreshToken(response.refreshToken);
    
    // 5. Redirect to inbox
    navigate('/inbox');
  }
  
  handleCallback();
}, []);
```

#### Step 8-9: Backend Exchanges Code for Tokens

```typescript
// Backend: src/modules/auth/auth.service.ts

async authenticateWithGoogle(dto: GoogleAuthDto) {
  // 1. Exchange authorization code for tokens
  const googleTokens = await this.googleOAuthService.exchangeCodeForTokens(
    dto.code,
    dto.codeVerifier
  );
  
  // Google returns:
  // {
  //   access_token: "ya29.a0AfB_byD...",     // Call Gmail API (1 hour)
  //   refresh_token: "1//0gYWz9N1sN...",     // Get new tokens (no expiry!)
  //   id_token: "eyJhbGciOiJSUzI1NiIs...",  // User info
  //   expires_in: 3600,
  //   scope: "openid email profile gmail.readonly gmail.modify",
  //   token_type: "Bearer"
  // }
  
  // 2. Verify ID token and extract user info
  const userInfo = await this.googleOAuthService.verifyIdToken(
    googleTokens.idToken
  );
  // { googleId, email, firstName, lastName, avatarUrl }
  
  // 3. Create or update user in database
  let user = await this.userRepository.findOne({
    where: { googleId: userInfo.googleId }
  });
  
  if (!user) {
    user = this.userRepository.create({
      email: userInfo.email,
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      googleId: userInfo.googleId,
      avatarUrl: userInfo.avatarUrl,
      authProvider: 'GOOGLE',
      isEmailVerified: true
    });
    await this.userRepository.save(user);
  }
  
  // 4. Store Google tokens (ENCRYPTED) for Gmail API access
  await this.userGoogleTokenRepository.save({
    userId: user.id,
    accessToken: await encrypt(googleTokens.access_token),
    refreshToken: await encrypt(googleTokens.refresh_token),
    expiresAt: new Date(Date.now() + googleTokens.expires_in * 1000)
  });
  
  // 5. Generate YOUR app's JWT tokens
  const appTokens = await this.tokenService.generateTokens(user);
  
  return {
    userId: user.id,
    email: user.email,
    tokens: appTokens.accessToken,
    refreshToken: appTokens.refreshTokenId
  };
}
```

#### Step 10-12: Frontend Stores Tokens

```typescript
// src/store/authStore.ts

// Access token stored in memory (Zustand)
setAccessToken(response.tokens.accessToken);

// Refresh token stored in localStorage
localStorage.setItem('refreshToken', response.refreshToken);

// Navigate to inbox
navigate('/inbox');
```

---

## Security Features

### 1. PKCE (Proof Key for Code Exchange)

**Purpose**: Prevents authorization code interception attacks

**How it works**:
1. Frontend generates random `code_verifier`
2. Frontend hashes it to create `code_challenge`
3. Challenge sent to Google, verifier stored locally
4. After redirect, verifier sent to backend
5. Backend sends verifier to Google
6. Google validates verifier matches challenge
7. Only then are tokens issued

**Attack prevented**:
```
❌ Attacker intercepts authorization code
❌ Tries to exchange it for tokens
❌ Google rejects - no matching code_verifier
✅ User's tokens remain secure
```

### 2. State Parameter (CSRF Protection)

**Purpose**: Prevents cross-site request forgery

**How it works**:
1. Frontend generates random state before redirect
2. Stores state in sessionStorage
3. Google echoes state back in redirect
4. Frontend validates state matches
5. Rejects if mismatch (possible attack)

**Attack prevented**:
```
❌ Attacker tricks user into visiting malicious URL
❌ URL has attacker's authorization code
❌ Frontend checks state - doesn't match
✅ Attack blocked
```

### 3. Client Secret Protection

**Purpose**: Prevent token theft

**Implementation**:
- Client secret stored ONLY on backend
- Never sent to browser
- Never exposed in frontend code
- Only backend can exchange codes for tokens

**Attack prevented**:
```
❌ Attacker views frontend source code
❌ Looks for client secret
❌ Can't find it (only backend has it)
✅ Can't impersonate your app
```

### 4. Encrypted Token Storage

**Purpose**: Protect Google tokens at rest

**Implementation**:
- Google access/refresh tokens encrypted using AES-256-GCM
- Encryption key stored in backend environment
- Tokens decrypted only when needed for Gmail API calls

**Attack prevented**:
```
❌ Attacker gains database access
❌ Sees encrypted Google tokens
❌ Can't decrypt without encryption key
✅ User's Gmail remains secure
```

### 5. Two-Token System

**Your App's Tokens** (frontend uses):
- `accessToken` - In memory (15 min expiry)
- `refreshToken` - localStorage (7 day expiry)
- Used to authenticate with YOUR API

**Google's Tokens** (backend stores):
- `access_token` - Database encrypted (1 hour expiry)
- `refresh_token` - Database encrypted (no expiry)
- Used to access Gmail API

**Why separate?**
- User can logout from your app (revoke your tokens)
- Gmail access persists (backend can still sync emails)
- User can revoke Gmail access separately in Google Account settings

---

## What You Get from Google

### Tokens

**Google Access Token**:
```json
{
  "access_token": "ya29.a0AfB_byD...",
  "expires_in": 3600,
  "scope": "openid email profile gmail.readonly gmail.modify",
  "token_type": "Bearer"
}
```
- Valid for **1 hour**
- Can call Gmail API immediately
- Backend auto-refreshes when expired

**Google Refresh Token**:
```json
{
  "refresh_token": "1//0gYWz9N1sN..."
}
```
- **No expiration** (until user revokes)
- Stored encrypted in database
- Used to get new access tokens
- Enables background email sync without user interaction

### User Profile (from ID Token)

```json
{
  "sub": "110169484474386276334",
  "email": "user@gmail.com",
  "email_verified": true,
  "name": "John Doe",
  "given_name": "John",
  "family_name": "Doe",
  "picture": "https://lh3.googleusercontent.com/..."
}
```

### Gmail API Capabilities

With the tokens, backend can:
- ✅ Read emails
- ✅ Send emails
- ✅ Modify emails (star, delete, mark read)
- ✅ Search emails
- ✅ Manage labels
- ✅ Download attachments
- ✅ Everything needed for full email client!

---

## Troubleshooting

### Common Issues

#### 1. "redirect_uri_mismatch"

**Error message**: The redirect URI in the request does not match

**Solution**:
1. Go to Google Cloud Console → Credentials
2. Edit your OAuth client ID
3. Add **exact** redirect URI: `http://localhost:5173/auth/callback`
4. Click Save
5. Wait 5 minutes for changes to propagate

**Note**: URI must match exactly (including protocol, port, path)

#### 2. "Invalid state"

**Error message**: OAuth state validation failed

**Causes**:
- User refreshed `/auth/callback` page
- SessionStorage cleared during OAuth flow
- CSRF attack attempt

**Solution**:
1. Clear sessionStorage: `sessionStorage.clear()`
2. Go back to login page
3. Start OAuth flow again

#### 3. "Access denied"

**Error message**: User did not grant permissions

**Causes**:
- User clicked "Cancel" on Google consent screen
- App not verified (shows warning)

**Solution**:
- Normal behavior - user chose not to authorize
- Try again and click "Allow"
- For production: verify your app in Google Cloud Console

#### 4. Backend error: "Failed to exchange code"

**Error message**: Token exchange failed

**Causes**:
- Wrong `GOOGLE_CLIENT_SECRET` in backend .env
- Wrong `GOOGLE_REDIRECT_URI` in backend .env
- Authorization code expired (>10 minutes old)
- Code already used (codes are single-use)

**Solution**:
1. Check backend .env has correct credentials
2. Verify redirect URI matches Google Console
3. Complete OAuth flow faster
4. Start OAuth flow again (get new code)

#### 5. "Gmail API has not been enabled"

**Error message**: Gmail API is not enabled for this project

**Solution**:
1. Go to https://console.cloud.google.com/apis/library
2. Search "Gmail API"
3. Click "Enable"
4. Wait a few minutes
5. Try OAuth again

#### 6. Infinite redirect loop

**Symptoms**: Keeps redirecting between /login and /auth/callback

**Causes**:
- Tokens not saving to localStorage
- authStore not updating correctly
- Session restoration failing

**Solution**:
1. Open DevTools → Console, check for errors
2. Check Application → Local Storage for `refreshToken`
3. Check Network tab for `/auth/google` response
4. Clear all storage: `localStorage.clear(); sessionStorage.clear()`
5. Restart dev servers

#### 7. CORS errors

**Error message**: CORS policy: No 'Access-Control-Allow-Origin' header

**Solution**:
1. Check backend `CORS_ORIGINS` in .env includes `http://localhost:5173`
2. Restart backend server
3. Clear browser cache

---

## Production Deployment

### Environment Variables

**Frontend**:
```env
VITE_GOOGLE_CLIENT_ID=your-client-id
VITE_GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/callback
VITE_API_BASE_URL=https://api.yourdomain.com/v1
```

**Backend**:
```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/callback
CORS_ORIGINS=https://yourdomain.com
```

### Google Cloud Console

1. Add production redirect URI:
   ```
   https://yourdomain.com/auth/callback
   ```

2. Verify your app:
   - Go to OAuth consent screen
   - Submit for verification
   - Provide privacy policy, terms of service
   - Wait for Google approval (1-6 weeks)

3. Enable additional APIs if needed:
   - People API (contacts)
   - Calendar API (calendar events)

### Security Checklist

- [ ] Use HTTPS for all URLs
- [ ] Rotate client secret periodically
- [ ] Monitor OAuth token usage
- [ ] Set up token expiry alerts
- [ ] Implement rate limiting
- [ ] Add logging for OAuth attempts
- [ ] Review Google Cloud Console audit logs
- [ ] Set up OAuth consent screen properly
- [ ] Add privacy policy and terms of service
- [ ] Use environment variables (never hardcode secrets)

---

## Testing

### Manual Testing Checklist

- [ ] Click "Sign in with Google" button
- [ ] Redirects to Google consent screen
- [ ] Consent screen shows correct app name and logo
- [ ] Requested scopes are listed (email, profile, Gmail)
- [ ] Click "Allow"
- [ ] Redirects back to application
- [ ] User is logged in
- [ ] User profile displays (name, avatar)
- [ ] Can access protected routes (/inbox)
- [ ] Refresh page - session persists
- [ ] Backend logs show "User authenticated successfully"
- [ ] Database has user record
- [ ] Database has encrypted Google tokens

### Error Testing

- [ ] Test clicking "Cancel" on consent screen
- [ ] Test with invalid redirect URI
- [ ] Test with expired authorization code
- [ ] Test refreshing /auth/callback page
- [ ] Test without Gmail API enabled
- [ ] Test network disconnection during flow

---

## FAQ

### Q: Why not use the simple `<GoogleLogin>` button?

**A**: The `<GoogleLogin>` component from `@react-oauth/google` only returns an **ID token**, which:
- ❌ Doesn't provide Gmail API access
- ❌ Doesn't include refresh token
- ❌ Can't be used for background email sync
- ❌ Not suitable for email clients

Your backend needs the **Authorization Code flow** to get refresh tokens and Gmail API access.

### Q: Can I skip PKCE for simplicity?

**A**: No. PKCE is **required** for public clients (SPAs, mobile apps) according to OAuth 2.0 security best practices. Without it, authorization codes can be intercepted and used by attackers.

### Q: Why store refresh token in localStorage?

**A**: For session persistence across page refreshes. In production, consider:
- HttpOnly cookies (not accessible via JavaScript)
- Secure flag (HTTPS only)
- SameSite attribute (CSRF protection)

### Q: How long do tokens last?

- **Access token (yours)**: 15 minutes
- **Refresh token (yours)**: 7 days
- **Google access token**: 1 hour
- **Google refresh token**: Until user revokes (no expiry)

### Q: What if user revokes Gmail access?

User can revoke access at https://myaccount.google.com/permissions

When this happens:
1. Backend's stored Google refresh token becomes invalid
2. Background email sync fails
3. User sees error: "Gmail access revoked"
4. User must re-authenticate via OAuth to reconnect

### Q: Can I use this for other Google APIs?

**Yes!** Just add scopes to OAuth URL:
- Calendar: `https://www.googleapis.com/auth/calendar`
- Drive: `https://www.googleapis.com/auth/drive.file`
- Contacts: `https://www.googleapis.com/auth/contacts.readonly`

---

## Additional Resources

- [OAuth 2.0 RFC 6749](https://datatracker.ietf.org/doc/html/rfc6749)
- [PKCE RFC 7636](https://datatracker.ietf.org/doc/html/rfc7636)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Gmail API Reference](https://developers.google.com/gmail/api/reference/rest)
- [OAuth 2.0 Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)

---

**Last Updated**: December 2, 2025  
**Status**: ✅ Implemented and Working
