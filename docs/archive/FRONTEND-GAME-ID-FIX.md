# Frontend Fix: Game ID Issue

## Problem
Frontend is sending `undefined` as the game ID, causing errors:
- ❌ `/games/undefined` (GET)
- ❌ `/games/undefined/join` (POST)

Backend error:
```
Cast to ObjectId failed for value "undefined" (type string) at path "_id"
```

## Root Cause
The backend returns games with `_id` field (MongoDB's ID field), but the frontend might be looking for `id`. Also, the response is wrapped in a `data` object.

### Backend Response Format:
```json
{
  "data": {
    "_id": "68f160447450fcd51b2d76cf",  // ← MongoDB uses _id, not id
    "whitePlayer": "...",
    "status": "waiting",
    "currentPosition": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    // ... other fields
  },
  "statusCode": 201,
  "timestamp": "2025-10-16T21:14:44.225Z",
  "path": "/games"
}
```

## Frontend Fixes Needed

### 1. Update Type Definitions

**File: `/Users/prathamnigam/lila-game-frontend/src/types/index.ts`**

Change:
```typescript
export interface Game {
  id: string;  // ❌ WRONG - MongoDB uses _id
  // ...
}
```

To:
```typescript
export interface Game {
  _id: string;  // ✅ CORRECT - matches MongoDB
  whitePlayer: string | User;
  blackPlayer?: string | User;
  status: 'waiting' | 'active' | 'completed' | 'abandoned';
  result: 'ongoing' | 'white_win' | 'black_win' | 'draw' | 'abandoned';
  currentPosition: string;
  currentTurn: 'white' | 'black';
  moves: Move[];
  timeControlInitial: number;
  timeControlIncrement: number;
  whiteTimeRemaining: number;
  blackTimeRemaining: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

### 2. Update Game Store

**File: `/Users/prathamnigam/lila-game-frontend/src/store/gameStore.ts`**

Fix the `createGame` and `joinGame` functions:

```typescript
import { create } from 'zustand';
import api from '../services/api';
import { Game } from '../types';

interface GameState {
  games: Game[];
  currentGame: Game | null;
  loading: boolean;
  error: string | null;
  
  fetchGames: () => Promise<void>;
  createGame: (timeControl: number) => Promise<Game>;
  joinGame: (gameId: string) => Promise<void>;
  fetchGame: (gameId: string) => Promise<void>;
  setCurrentGame: (game: Game | null) => void;
}

const useGameStore = create<GameState>((set, get) => ({
  games: [],
  currentGame: null,
  loading: false,
  error: null,

  fetchGames: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/games');
      // Unwrap the transformed response
      const games = response.data.data;
      set({ games, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch games',
        loading: false 
      });
    }
  },

  createGame: async (timeControlMinutes: number) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/games', { timeControlMinutes });
      
      // IMPORTANT: Unwrap the response
      const game = response.data.data;
      
      // Add to games list
      set((state) => ({ 
        games: [...state.games, game],
        currentGame: game,
        loading: false 
      }));
      
      return game;  // Return the game object with _id
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to create game';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  joinGame: async (gameId: string) => {
    set({ loading: true, error: null });
    try {
      // Use the gameId directly (should be _id from the game object)
      const response = await api.post(`/games/${gameId}/join`);
      
      // Unwrap the response
      const game = response.data.data;
      
      set({ currentGame: game, loading: false });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to join game';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  fetchGame: async (gameId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/games/${gameId}`);
      
      // Unwrap the response
      const game = response.data.data;
      
      set({ currentGame: game, loading: false });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch game';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  setCurrentGame: (game: Game | null) => {
    set({ currentGame: game });
  },
}));

export default useGameStore;
```

### 3. Update Game Lobby Page

**File: `/Users/prathamnigam/lila-game-frontend/src/pages/GameLobbyPage.tsx`**

Fix the navigation to use `_id`:

```typescript
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useGameStore from '../store/gameStore';
import useAuthStore from '../store/authStore';

export default function GameLobbyPage() {
  const navigate = useNavigate();
  const { games, loading, error, fetchGames, createGame, joinGame } = useGameStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const handleCreateGame = async () => {
    try {
      const game = await createGame(10); // 10 minute game
      
      // IMPORTANT: Use _id from the game object
      navigate(`/game/${game._id}`);  // ✅ Use _id
    } catch (error) {
      console.error('Failed to create game:', error);
    }
  };

  const handleJoinGame = async (gameId: string) => {
    try {
      await joinGame(gameId);
      
      // IMPORTANT: Use the gameId that was passed (which is _id)
      navigate(`/game/${gameId}`);  // ✅ Use _id
    } catch (error) {
      console.error('Failed to join game:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Game Lobby</h1>
        <button
          onClick={handleCreateGame}
          className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
        >
          Create New Game
        </button>
      </div>

      <div className="grid gap-4">
        {games.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No games available. Create a new game to start playing!
          </div>
        ) : (
          games.map((game) => (
            // IMPORTANT: Use _id as the key and in the join handler
            <div key={game._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">
                    Time Control: {game.timeControlInitial / 60000} min
                    {game.timeControlIncrement > 0 && ` + ${game.timeControlIncrement / 1000}s`}
                  </p>
                  <p className="text-sm text-gray-500">
                    Status: <span className="font-medium">{game.status}</span>
                  </p>
                </div>
                
                {game.status === 'waiting' && game.whitePlayer !== user?.id && (
                  <button
                    onClick={() => handleJoinGame(game._id)}  // ✅ Use _id
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Join Game
                  </button>
                )}
                
                {game.status === 'active' && (
                  <button
                    onClick={() => navigate(`/game/${game._id}`)}  // ✅ Use _id
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    View Game
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

### 4. Update Game Play Page

**File: `/Users/prathamnigam/lila-game-frontend/src/pages/GamePlayPage.tsx`**

Fix the game ID extraction:

```typescript
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';
import useGameStore from '../store/gameStore';
import useAuthStore from '../store/authStore';
import socket from '../services/socket';

export default function GamePlayPage() {
  const { gameId } = useParams<{ gameId: string }>();  // This comes from the URL
  const { currentGame, fetchGame } = useGameStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (gameId) {
      // Fetch game using the _id from URL params
      fetchGame(gameId);
      
      // Join the socket room
      socket.emit('joinGame', { gameId });
      
      // Listen for game updates
      socket.on('gameUpdate', (updatedGame) => {
        // Update the current game
        useGameStore.setState({ currentGame: updatedGame });
      });
      
      return () => {
        socket.emit('leaveGame', { gameId });
        socket.off('gameUpdate');
      };
    }
  }, [gameId, fetchGame]);

  const handleMove = (sourceSquare: string, targetSquare: string) => {
    if (!currentGame || !gameId) return;

    // Send move to backend
    socket.emit('makeMove', {
      gameId,  // Use the _id
      from: sourceSquare,
      to: targetSquare,
    });
  };

  if (!currentGame) {
    return <div className="flex justify-center items-center h-screen">Loading game...</div>;
  }

  // Determine board orientation
  const orientation = currentGame.whitePlayer === user?.id ? 'white' : 'black';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chessboard */}
        <div className="lg:col-span-2">
          <Chessboard
            position={currentGame.currentPosition}
            boardOrientation={orientation}
            onPieceDrop={(sourceSquare, targetSquare) => {
              handleMove(sourceSquare, targetSquare);
              return true;
            }}
            customBoardStyle={{
              borderRadius: '4px',
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',
            }}
          />
        </div>

        {/* Game Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Game Info</h2>
          <div className="space-y-2">
            <p><strong>Status:</strong> {currentGame.status}</p>
            <p><strong>Turn:</strong> {currentGame.currentTurn}</p>
            <p><strong>White Time:</strong> {Math.floor(currentGame.whiteTimeRemaining / 1000)}s</p>
            <p><strong>Black Time:</strong> {Math.floor(currentGame.blackTimeRemaining / 1000)}s</p>
          </div>

          {/* Move History */}
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-2">Moves</h3>
            <div className="max-h-64 overflow-y-auto">
              {currentGame.moves.map((move, index) => (
                <div key={index} className="text-sm py-1">
                  {index + 1}. {move.from} → {move.to}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 5. Update Router

**File: `/Users/prathamnigam/lila-game-frontend/src/App.tsx`**

Make sure the route uses `:gameId`:

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Layout/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GameLobbyPage from './pages/GameLobbyPage';
import GamePlayPage from './pages/GamePlayPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/lobby" element={<GameLobbyPage />} />
          <Route path="/game/:gameId" element={<GamePlayPage />} />  {/* ✅ Use :gameId */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
```

## Quick Checklist

- [ ] Update `types/index.ts` - change `id` to `_id` in Game interface
- [ ] Update `gameStore.ts` - unwrap responses with `response.data.data`
- [ ] Update `GameLobbyPage.tsx` - use `game._id` for navigation and joining
- [ ] Update `GamePlayPage.tsx` - use `gameId` from URL params
- [ ] Update `App.tsx` - ensure route is `/game/:gameId`
- [ ] Test: Create game → should navigate to `/game/68f160447450fcd51b2d76cf`
- [ ] Test: Join game → should navigate to `/game/:gameId` with valid ID
- [ ] Test: No more `/games/undefined` errors in backend logs

## Testing

After making these changes:

1. **Create a game:**
   ```
   Click "Create New Game" → Should navigate to /game/68f1604...
   ```

2. **Check DevTools Network:**
   ```
   Should see: POST /games/68f1604.../join (not /games/undefined/join)
   ```

3. **Check Backend Logs:**
   ```
   Should NOT see: "Cast to ObjectId failed for value 'undefined'"
   ```

4. **Verify Game ID in URL:**
   ```
   URL bar should show: http://localhost:5173/game/68f160447450fcd51b2d76cf
   ```

## Summary

The issue is that MongoDB returns `_id` but your TypeScript types might define `id`. The frontend must:
1. Use `_id` (not `id`) in all Game interfaces
2. Unwrap API responses: `response.data.data`
3. Pass `game._id` when navigating or making API calls

All the code snippets above show the exact fixes needed!
