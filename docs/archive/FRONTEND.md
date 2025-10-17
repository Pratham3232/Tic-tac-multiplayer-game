# 🎨 Lila Game Frontend

## Frontend Options for Lila Game Backend

You have several options to build the frontend for your Lila Game Backend:

## Option 1: React + Vite (Recommended) ⚡

### Quick Setup

```bash
# Create React app with Vite in a new directory
cd /Users/prathamnigam
npm create vite@latest lila-game-frontend -- --template react-ts

cd lila-game-frontend
npm install

# Install additional dependencies
npm install axios socket.io-client react-router-dom zustand
npm install -D @types/node
```

### Project Structure
```
lila-game-frontend/
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── Game/
│   │   │   ├── GameBoard.tsx
│   │   │   ├── GameList.tsx
│   │   │   └── MoveHistory.tsx
│   │   └── Layout/
│   │       ├── Header.tsx
│   │       └── Sidebar.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── GameLobby.tsx
│   │   └── GamePlay.tsx
│   ├── services/
│   │   ├── api.ts
│   │   └── socket.ts
│   ├── store/
│   │   ├── authStore.ts
│   │   └── gameStore.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── vite.config.ts
```

## Option 2: Next.js 14 (SSR/SSG) 🚀

### Quick Setup

```bash
# Create Next.js app
cd /Users/prathamnigam
npx create-next-app@latest lila-game-frontend --typescript --tailwind --app

cd lila-game-frontend
npm install axios socket.io-client zustand
```

### Project Structure
```
lila-game-frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── games/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
├── lib/
│   ├── api.ts
│   └── socket.ts
└── store/
```

## Option 3: Vue 3 + Vite 🖖

### Quick Setup

```bash
cd /Users/prathamnigam
npm create vite@latest lila-game-frontend -- --template vue-ts

cd lila-game-frontend
npm install
npm install axios socket.io-client pinia vue-router
```

## Core Frontend Features to Implement

### 1. Authentication 🔐
- Login page
- Registration page
- JWT token management
- Protected routes
- Auto token refresh

### 2. Game Lobby 🎮
- List of active games
- Create new game
- Join existing game
- Player search
- Friend list

### 3. Game Board ♟️
- Interactive chess board
- Drag & drop pieces
- Move validation
- Timer display
- Captured pieces display

### 4. Real-time Features ⚡
- Live move updates
- Player presence
- Game chat
- Notifications

### 5. User Profile 👤
- User statistics
- Game history
- Rating display
- Edit profile

## Recommended Tech Stack

### Core
- **React 18** or **Vue 3** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool

### Routing
- **React Router v6** (React)
- **Vue Router v4** (Vue)

### State Management
- **Zustand** (React - lightweight)
- **Pinia** (Vue)
- **Redux Toolkit** (React - complex apps)

### Styling
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Beautiful components
- **Material-UI** - Component library
- **Ant Design** - Enterprise UI

### Chess Board
- **react-chessboard** - React chess component
- **chessboard.jsx** - Vanilla JS chess board
- **chess.js** - Chess logic validation

### API & Real-time
- **Axios** - HTTP client
- **Socket.IO Client** - WebSocket
- **React Query** - Data fetching (optional)

## Quick Implementation Guide

### 1. API Service

```typescript
// src/services/api.ts
import axios from 'axios';

const API_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

export const gamesAPI = {
  createGame: (data: any) => api.post('/games', data),
  getActiveGames: () => api.get('/games'),
  getGame: (id: string) => api.get(`/games/${id}`),
  joinGame: (id: string) => api.post(`/games/${id}/join`),
  makeMove: (id: string, move: any) => api.post(`/games/${id}/moves`, move),
};

export default api;
```

### 2. Socket Service

```typescript
// src/services/socket.ts
import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    this.socket = io('http://localhost:3000', {
      auth: { token },
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
    });
  }

  disconnect() {
    this.socket?.disconnect();
  }

  joinGame(gameId: string) {
    this.socket?.emit('joinGame', { gameId });
  }

  makeMove(gameId: string, move: any) {
    this.socket?.emit('makeMove', { gameId, move });
  }

  onGameUpdate(callback: (data: any) => void) {
    this.socket?.on('gameUpdate', callback);
  }

  onChatMessage(callback: (data: any) => void) {
    this.socket?.on('chatMessage', callback);
  }
}

export default new SocketService();
```

### 3. Auth Store (Zustand)

```typescript
// src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  user: any | null;
  isAuthenticated: boolean;
  login: (token: string, user: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      login: (token, user) =>
        set({ token, user, isAuthenticated: true }),
      logout: () =>
        set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

### 4. Sample Login Component

```typescript
// src/components/Auth/LoginForm.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export const LoginForm: React.FC = () => {
  const [credentials, setCredentials] = useState({
    usernameOrEmail: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await authAPI.login(credentials);
      login(data.accessToken, data.user);
      navigate('/games');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      <input
        type="text"
        placeholder="Username or Email"
        className="w-full p-2 mb-4 border rounded"
        value={credentials.usernameOrEmail}
        onChange={(e) =>
          setCredentials({ ...credentials, usernameOrEmail: e.target.value })
        }
      />
      
      <input
        type="password"
        placeholder="Password"
        className="w-full p-2 mb-4 border rounded"
        value={credentials.password}
        onChange={(e) =>
          setCredentials({ ...credentials, password: e.target.value })
        }
      />
      
      <button
        type="submit"
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        Login
      </button>
    </form>
  );
};
```

### 5. Sample Game Board Component

```typescript
// src/components/Game/GameBoard.tsx
import React, { useEffect, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import socketService from '../../services/socket';

interface GameBoardProps {
  gameId: string;
}

export const GameBoard: React.FC<GameBoardProps> = ({ gameId }) => {
  const [game, setGame] = useState(new Chess());
  const [position, setPosition] = useState(game.fen());

  useEffect(() => {
    socketService.joinGame(gameId);

    socketService.onGameUpdate((data) => {
      const newGame = new Chess(data.position);
      setGame(newGame);
      setPosition(newGame.fen());
    });

    return () => {
      socketService.disconnect();
    };
  }, [gameId]);

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      });

      if (move) {
        socketService.makeMove(gameId, {
          from: sourceSquare,
          to: targetSquare,
          piece: move.piece,
        });
        setPosition(game.fen());
        return true;
      }
    } catch (error) {
      return false;
    }
    return false;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Chessboard
        position={position}
        onPieceDrop={onDrop}
        boardWidth={560}
      />
    </div>
  );
};
```

## Installation Steps (React + Vite)

### Step 1: Create Frontend Project

```bash
# Navigate to parent directory
cd /Users/prathamnigam

# Create Vite React TypeScript project
npm create vite@latest lila-game-frontend -- --template react-ts

cd lila-game-frontend
```

### Step 2: Install Dependencies

```bash
# Core dependencies
npm install

# Additional packages
npm install axios socket.io-client react-router-dom zustand

# Chess components
npm install react-chessboard chess.js

# UI components (optional)
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Step 3: Configure Tailwind (Optional)

```javascript
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### Step 4: Update Environment

```bash
# Create .env file
echo "VITE_API_URL=http://localhost:3000" > .env
```

### Step 5: Run Development Server

```bash
npm run dev
# Open http://localhost:5173
```

## Project Timeline

### Phase 1: Basic Setup (1-2 hours)
- Project initialization
- Routing setup
- API integration
- Auth pages

### Phase 2: Core Features (3-4 hours)
- Game lobby
- Game creation
- Game board
- Basic gameplay

### Phase 3: Real-time (2-3 hours)
- WebSocket integration
- Live moves
- Chat system
- Presence

### Phase 4: Polish (2-3 hours)
- Styling
- Animations
- Error handling
- Testing

**Total: ~8-12 hours for a functional frontend**

## Alternative: Pre-built Templates

### 1. Use a Chess Template
- [Lichess](https://github.com/lichess-org/lila) - Open source chess platform
- [Chess.com Clone](https://github.com/search?q=chess+clone+react)

### 2. Use a Game Template
- React Game Kit
- Phaser.js for 2D games

## Connect Frontend to Backend

Update your backend CORS settings:

```typescript
// src/main.ts
app.enableCors({
  origin: ['http://localhost:5173', 'http://localhost:3001'],
  credentials: true,
});
```

## Deployment

### Frontend Deployment Options
- **Vercel** - Best for React/Next.js
- **Netlify** - Great for static sites
- **AWS S3 + CloudFront** - Scalable
- **Railway** - Easy deployment
- **GitHub Pages** - Free hosting

### Deploy Command
```bash
npm run build
# Upload dist/ folder to hosting service
```

## Next Steps

1. **Create the frontend project** using one of the options above
2. **Implement authentication** pages first
3. **Build game lobby** to list and join games
4. **Create game board** component
5. **Add real-time** features with Socket.IO
6. **Style and polish** the UI
7. **Test end-to-end** gameplay
8. **Deploy** to hosting platform

Would you like me to:
1. **Generate a complete React frontend** in a new directory?
2. **Create a Next.js frontend** with SSR?
3. **Provide more detailed component code**?
4. **Set up a mobile app** with React Native?

Let me know which approach you'd prefer! 🚀