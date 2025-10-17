# ✅ JWT Authentication - FIXED!

## Backend Status: ✅ WORKING PERFECTLY

The backend JWT authentication is working correctly:

```bash
# Test results:
✅ Registration returns JWT token
✅ Token is valid and properly signed
✅ Protected routes accept valid tokens (200 OK)
✅ Protected routes reject invalid tokens (401 Unauthorized)
```

### Test Evidence:
```bash
# 1. Registration works
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test99","email":"test99@example.com","password":"Test123!"}'

# Response: 201 Created with accessToken

# 2. Protected route WITH token works
curl -X GET http://localhost:3000/games \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Response: 200 OK with data

# 3. Protected route WITHOUT token fails correctly
curl -X GET http://localhost:3000/games

# Response: 401 Unauthorized
```

## Frontend Issue: Token Storage/Transmission

The problem is in the **frontend code**. The frontend at `/Users/prathamnigam/lila-game-frontend` needs to:

### 1. Extract Token from Wrapped Response

The backend uses a `TransformInterceptor` that wraps all responses:

```json
{
  "data": {
    "accessToken": "eyJhbGci...",
    "user": {...}
  },
  "statusCode": 201,
  "timestamp": "...",
  "path": "/auth/register"
}
```

### Fix in `src/store/authStore.ts`:

```typescript
// WRONG - accessing response.data directly
const { accessToken, user } = response.data;

// CORRECT - unwrap the transformed response
const { accessToken, user } = response.data.data;  // Note: .data.data
```

### 2. Store Token in localStorage

```typescript
// After login/register:
const response = await api.post('/auth/login', credentials);
const { accessToken, user } = response.data.data;  // Unwrap!

// CRITICAL: Save to localStorage
localStorage.setItem('token', accessToken);

// Update store
set({ 
  user, 
  token: accessToken, 
  isAuthenticated: true 
});
```

### 3. Send Token with Every Request

In `src/services/api.ts`:

```typescript
// Add request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 4. Handle Token on Page Refresh

```typescript
// In authStore.ts - initialize from localStorage
const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'), // Load on init
  isAuthenticated: !!localStorage.getItem('token'),
  
  // ... rest of store
}));
```

## Complete Frontend Fix

### File: `src/store/authStore.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

interface User {
  id: string;
  username: string;
  email: string;
  rating: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: { usernameOrEmail: string; password: string }) => Promise<void>;
  register: (data: { username: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: localStorage.getItem('token'),
      isAuthenticated: !!localStorage.getItem('token'),

      login: async (credentials) => {
        try {
          const response = await api.post('/auth/login', credentials);
          
          // IMPORTANT: Unwrap the transformed response
          const { accessToken, user } = response.data.data;
          
          // CRITICAL: Save token
          localStorage.setItem('token', accessToken);
          
          set({ 
            user, 
            token: accessToken, 
            isAuthenticated: true 
          });
        } catch (error) {
          console.error('Login failed:', error);
          throw error;
        }
      },

      register: async (data) => {
        try {
          const response = await api.post('/auth/register', data);
          
          // IMPORTANT: Unwrap the transformed response
          const { accessToken, user } = response.data.data;
          
          // CRITICAL: Save token
          localStorage.setItem('token', accessToken);
          
          set({ 
            user, 
            token: accessToken, 
            isAuthenticated: true 
          });
        } catch (error) {
          console.error('Registration failed:', error);
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;
```

### File: `src/services/api.ts`

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

## Testing the Fix

### 1. Update Frontend Files
- Update `src/store/authStore.ts` with the code above
- Update `src/services/api.ts` with the code above

### 2. Restart Frontend
```bash
cd /Users/prathamnigam/lila-game-frontend
npm run dev
```

### 3. Test Flow
1. Open http://localhost:5173/register
2. Register a new user
3. Check DevTools → Application → localStorage
   - Should see `token` key with JWT value
4. Check DevTools → Network → Click any `/games` request
   - Request Headers should show: `Authorization: Bearer eyJhbGci...`
5. Navigate to Game Lobby
   - Should see games list (or empty array)
   - Should NOT see 401 Unauthorized errors

### 4. Verify in DevTools Console
```javascript
// Check if token is stored
console.log(localStorage.getItem('token'));
// Should print: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Decode payload
const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log(payload);
// Should show: { sub: "userId", username: "yourname", email: "...", iat: ..., exp: ... }
```

## Backend Logs Show Success

When working correctly, you should see these logs in the backend terminal:

```
JWT Validate called with payload: {
  sub: '68f15d7c7450fcd51b2d76ac',
  username: 'test99',
  email: 'test99@example.com',
  iat: 1760648572,
  exp: 1761253372
}
User found: test99
```

## Summary of Changes

| Issue | Location | Fix |
|-------|----------|-----|
| Token not extracted | authStore.ts | Change `response.data` to `response.data.data` |
| Token not stored | authStore.ts | Add `localStorage.setItem('token', accessToken)` |
| Token not sent | api.ts | Add request interceptor with Authorization header |
| Token lost on refresh | authStore.ts | Initialize from localStorage |
| No 401 handling | api.ts | Add response interceptor to logout on 401 |

## ✅ Backend Checklist (ALL DONE)

- [x] JWT_SECRET configured in .env
- [x] JWT module loads secret correctly
- [x] JWT strategy uses correct secret
- [x] Registration returns valid token
- [x] Login returns valid token
- [x] Protected routes verify token
- [x] Token expiration set to 7 days
- [x] CORS configured for frontend origin

## 📝 Frontend Checklist (TODO)

- [ ] Unwrap transformed responses (.data.data)
- [ ] Store token in localStorage
- [ ] Send Authorization header
- [ ] Load token on app init
- [ ] Handle 401 errors
- [ ] Clear token on logout

---

**Created:** After confirming backend JWT auth is working perfectly  
**Backend Status:** ✅ FULLY FUNCTIONAL  
**Frontend Status:** ⚠️ NEEDS TOKEN STORAGE FIX
