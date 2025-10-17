# JWT Authentication Fix Guide

## Problem
Users receiving "Unauthorized 401" errors when trying to access protected routes (like `/games`). The JWT token is either:
1. Not being generated with the correct secret
2. Not being sent from the frontend
3. Not being validated correctly on the backend

## Root Cause
The JWT secret configuration wasn't being read properly from environment variables, causing a mismatch between token signing and validation.

## Solution Applied

### 1. Backend Fixes

#### Updated `src/auth/jwt.strategy.ts`
- Added fallback logic to read JWT_SECRET from multiple sources
- Added console logging to verify secret is loaded
- Now tries: `jwt.secret` → `JWT_SECRET` → fallback value

#### Updated `src/auth/auth.module.ts`
- Added similar fallback logic for JWT module configuration
- Added console logging for debugging
- Properly handles both `jwt.secret` and `JWT_SECRET` env vars

### 2. Verify Your .env File
Ensure your `.env` file has:
```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

### 3. Frontend Token Storage

The frontend needs to properly:
1. **Store the token** after login/register:
```typescript
// In authStore.ts
login: async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  const { accessToken, user } = response.data;
  localStorage.setItem('token', accessToken);  // CRITICAL!
  set({ user, token: accessToken, isAuthenticated: true });
}
```

2. **Send the token** with every request:
```typescript
// In api.ts
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;  // CRITICAL!
  }
  return config;
});
```

## Testing Steps

### 1. Restart Backend
```bash
cd /Users/prathamnigam/lila-game-project
npm run start:dev
```

**Check console output** for:
```
JWT Module configured with secret: ***tion
JWT Module expiresIn: 7d
JWT Strategy initialized with secret: ***tion
```

### 2. Test Registration
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

**Expected response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "username": "testuser",
    "email": "test@example.com",
    "rating": 1200
  }
}
```

### 3. Test Protected Route with Token
```bash
# Save the token from registration
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:3000/games \
  -H "Authorization: Bearer $TOKEN"
```

**Expected response:** List of games (or empty array `[]`)
**NOT:** `{"statusCode": 401, "message": "Unauthorized"}`

## Frontend Debugging

### Check Browser DevTools

1. **Network Tab**
   - Look for the `/games` request
   - Check Request Headers
   - Should see: `Authorization: Bearer eyJhbGci...`

2. **Application/Storage Tab**
   - Check localStorage
   - Should see key `token` with JWT value
   - Format: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

3. **Console Tab**
   - Check for errors like "No token found" or similar

### Common Frontend Issues

#### Issue 1: Token Not Saved After Login
```typescript
// WRONG - token not saved
const response = await api.post('/auth/login', credentials);
set({ user: response.data.user });

// CORRECT - save token
const response = await api.post('/auth/login', credentials);
localStorage.setItem('token', response.data.accessToken);
set({ user: response.data.user, token: response.data.accessToken });
```

#### Issue 2: Token Not Sent with Requests
```typescript
// WRONG - no Authorization header
axios.get('/games');

// CORRECT - with interceptor
const token = localStorage.getItem('token');
axios.get('/games', {
  headers: { Authorization: `Bearer ${token}` }
});
```

#### Issue 3: Token Cleared on Refresh
```typescript
// Add persistence to Zustand store
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: localStorage.getItem('token'),
      // ... rest of store
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
    }
  )
);
```

## Manual Verification Script

Create `test-auth.sh`:
```bash
#!/bin/bash

echo "1. Testing Registration..."
RESPONSE=$(curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser'$(date +%s)'",
    "email": "test'$(date +%s)'@example.com",
    "password": "Test123!"
  }')

echo "$RESPONSE" | jq '.'

TOKEN=$(echo "$RESPONSE" | jq -r '.accessToken')

echo ""
echo "2. Testing Protected Route with Token..."
curl -s -X GET http://localhost:3000/games \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo ""
echo "3. Testing Protected Route WITHOUT Token (should fail)..."
curl -s -X GET http://localhost:3000/games | jq '.'
```

Run:
```bash
chmod +x test-auth.sh
./test-auth.sh
```

## JWT Token Structure

A valid JWT token has 3 parts separated by dots:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NzMwNj...
│          HEADER          │      PAYLOAD       │   SIGNATURE   │
```

### Decode Token (for debugging)
```bash
# On macOS/Linux
TOKEN="your-token-here"
echo $TOKEN | cut -d. -f2 | base64 -d 2>/dev/null | jq '.'
```

Should show:
```json
{
  "sub": "user-id-here",
  "username": "testuser",
  "email": "test@example.com",
  "iat": 1697587200,
  "exp": 1698192000
}
```

## Still Having Issues?

### Check These:

1. **Backend logs show the secret?**
   ```
   JWT Module configured with secret: ***tion  ✓
   ```

2. **Frontend stores token?**
   - Open DevTools → Application → Local Storage
   - See `token` key? ✓

3. **Frontend sends token?**
   - Open DevTools → Network → Click request
   - Request Headers has `Authorization: Bearer ...`? ✓

4. **Token not expired?**
   - Default expiry: 7 days
   - Decode token and check `exp` field

5. **CORS configured?**
   - Backend `main.ts` should allow frontend origin
   - Should see CORS headers in response

### Get Full Error Details

Add this to `src/auth/jwt.strategy.ts`:
```typescript
async validate(payload: JwtPayload) {
  console.log('JWT Validate called with payload:', payload);
  const user = await this.usersService.findById(payload.sub);
  console.log('User found:', user ? user.username : 'NOT FOUND');
  if (!user) {
    throw new UnauthorizedException('User not found');
  }
  return user;
}
```

This will show you exactly what's failing in the JWT validation process.

## Quick Fix Checklist

- [ ] `.env` has `JWT_SECRET=your-super-secret-jwt-key-change-this-in-production`
- [ ] Backend restarted after `.env` change
- [ ] Console shows JWT secret loaded (check for `***tion`)
- [ ] Registration returns `accessToken` in response
- [ ] Frontend saves token to localStorage after login
- [ ] Frontend sends `Authorization: Bearer <token>` header
- [ ] Protected routes work with token
- [ ] Protected routes fail without token (401)

## Success Indicators

✅ Registration returns token
✅ Login returns token  
✅ Token visible in localStorage
✅ `/games` request has Authorization header
✅ `/games` returns 200 (not 401)
✅ Backend logs show "JWT Validate called with payload"
✅ No "Unauthorized" errors in backend logs

---

**Last Updated:** After fixing JWT configuration fallback logic
