# 🎮 Lila Game - Multiplayer Tic-Tac-Toe Platform

A full-stack, real-time multiplayer Tic-Tac-Toe game platform with user authentication, matchmaking, and live gameplay. Built with NestJS, MongoDB, React, and WebSocket technology.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.0-red)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.19-green)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-black)](https://socket.io/)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [Frontend Setup](#-frontend-setup)
- [API Documentation](#-api-documentation)
- [WebSocket Events](#-websocket-events)
- [Game Logic](#-game-logic)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🔐 Authentication & User Management
- JWT-based authentication with secure token handling
- User registration and login
- Password hashing with bcryptjs
- User profiles with ratings and statistics
- Friend system (add/remove friends)
- Activity tracking (last seen, online status)

### 🎯 Game Features
- **Create Games**: Custom time controls and game names
- **Random Matchmaking**: Automatic opponent matching based on rating (±100 rating range)
- **Real-time Gameplay**: Live move updates via WebSocket
- **Game History**: Track all past games and results
- **Rating System**: Elo-style rating updates (+200 win, -100 loss)
- **Game States**: Waiting, In Progress, Completed, Abandoned
- **Move Validation**: Server-side validation for all moves

### 💬 Real-time Features
- Live game state synchronization
- In-game chat messaging
- Online/offline user status
- Player join/leave notifications
- Draw requests and responses
- Game end notifications

### 📊 Game Board Logic
- Standard 3x3 Tic-Tac-Toe grid
- Win detection (rows, columns, diagonals)
- Draw detection (board full, no winner)
- Move history tracking
- Turn-based gameplay validation

---

## 🛠 Tech Stack

### Backend
- **Framework**: NestJS 11.0.1
- **Language**: TypeScript 5.7.2
- **Database**: MongoDB 8.19.1 with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens), Passport
- **Real-time**: Socket.IO 4.8.1
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest 30.0.0

### Frontend
- **Framework**: React 18.3.1
- **Build Tool**: Vite 5.4.20
- **Language**: TypeScript
- **Routing**: React Router 6.26.2
- **State Management**: Zustand 5.0.1
- **HTTP Client**: Axios 1.7.7
- **WebSocket**: Socket.IO Client 4.8.0
- **UI Components**: react-chessboard 4.7.2
- **Styling**: Tailwind CSS 3.4.12

### DevOps
- **Containerization**: Docker & Docker Compose
- **Database UI**: Mongo Express
- **Process Manager**: PM2 (optional)

---

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Start all services (MongoDB + Backend + Mongo Express)
docker-compose up -d

# View logs
docker-compose logs -f app

# Access the application
# Backend API: http://localhost:3000
# API Docs: http://localhost:3000/api/docs
# Mongo Express: http://localhost:8081 (admin/admin123)
```

### Option 2: Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Start MongoDB
docker-compose up -d mongodb

# 4. Start backend
npm run start:dev

# 5. Access the application
# Backend: http://localhost:3000
# API Docs: http://localhost:3000/api/docs
```

---

## 📁 Project Structure

```
lila-game-project/
├── src/
│   ├── auth/              # Authentication module (JWT, Login, Register)
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── jwt.strategy.ts
│   │   └── jwt-auth.guard.ts
│   ├── users/             # User management module
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   ├── games/             # Game management module
│   │   ├── games.controller.ts
│   │   ├── games.service.ts
│   │   └── games.module.ts
│   ├── gateway/           # WebSocket gateway
│   │   ├── game.gateway.ts
│   │   └── gateway.module.ts
│   ├── schemas/           # MongoDB schemas
│   │   ├── user.schema.ts
│   │   └── game.schema.ts
│   ├── dto/               # Data Transfer Objects
│   │   ├── auth.dto.ts
│   │   ├── user.dto.ts
│   │   └── game.dto.ts
│   ├── common/            # Shared utilities
│   │   ├── filters/       # Exception filters
│   │   ├── interceptors/  # Response interceptors
│   │   └── pipes/         # Validation pipes
│   ├── config/            # Configuration files
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   └── jwt.config.ts
│   └── main.ts            # Application entry point
├── test/                  # E2E tests
├── docker-compose.yml     # Docker configuration
├── Dockerfile             # Docker build file
├── .env                   # Environment variables
└── package.json           # Dependencies
```

---

## 💻 Installation

### Prerequisites

- **Node.js**: v16+ (v24.5.0 recommended)
- **npm**: v8+ or yarn
- **MongoDB**: v7+ (or use Docker)
- **Docker**: (optional, for containerization)

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/Pratham3232/Tic-tac-multiplayer-game.git
cd lila-game-project

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

---

## ⚙️ Configuration

### Environment Variables (.env)

```env
# Database Configuration
DATABASE_URL=mongodb://admin:password123@localhost:27017/lila_game?authSource=admin
DATABASE_NAME=lila_game

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Application Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=100
```

### Docker Configuration (docker-compose.yml)

The project includes a complete Docker setup:

```yaml
services:
  mongodb:        # MongoDB database
  app:            # NestJS backend
  mongo-express:  # Database UI
```

**Default Credentials:**
- MongoDB: `admin` / `password123`
- Mongo Express: `admin` / `admin123`

---

## 🏃 Running the Application

### Development Mode

```bash
# Backend development server (hot-reload)
npm run start:dev

# Frontend development server (in frontend folder)
cd ../lila-game-frontend
npm run dev
```

### Production Mode

```bash
# Build backend
npm run build

# Start production server
npm run start:prod

# Build frontend
cd ../lila-game-frontend
npm run build
```

### Docker Mode

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f app

# Rebuild and restart
docker-compose up -d --build
```

### Access Points

- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api/docs
- **Frontend**: http://localhost:5173 (Vite dev server)
- **Mongo Express**: http://localhost:8081

---

## 🎨 Frontend Setup

The project includes a ready-to-use React frontend. Setup options:

### Option 1: Use Existing Frontend

```bash
# Navigate to frontend directory
cd ../lila-game-frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev

# Access at http://localhost:5173
```

### Option 2: Automated Setup Script

```bash
# Run from backend directory
./setup-frontend.sh

# This creates a complete React frontend with:
# - TypeScript configuration
# - React Router setup
# - Zustand state management
# - Socket.IO integration
# - Tailwind CSS styling
# - All game components
```

### Frontend Features

- **Authentication Pages**: Login, Register
- **Game Lobby**: Browse and create games
- **Random Match**: Quick matchmaking
- **Game Play**: Interactive Tic-Tac-Toe board
- **Real-time Updates**: Live move synchronization
- **In-game Chat**: Communicate with opponents
- **Game History**: View past games
- **User Profile**: Stats and ratings

---

## 📚 API Documentation

### Swagger UI

Once running, visit http://localhost:3000/api/docs for interactive API documentation.

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "username": "player1",
  "email": "player1@example.com",
  "password": "SecurePass123!"
}

Response: 201 Created
{
  "data": {
    "accessToken": "eyJhbGci...",
    "user": {
      "id": "68f15d7c...",
      "username": "player1",
      "email": "player1@example.com",
      "rating": 1200
    }
  }
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "usernameOrEmail": "player1",
  "password": "SecurePass123!"
}

Response: 200 OK
{
  "data": {
    "accessToken": "eyJhbGci...",
    "user": { ... }
  }
}
```

### Game Endpoints

#### Create Game
```http
POST /games
Authorization: Bearer {token}
Content-Type: application/json

{
  "gameName": "Quick Match",
  "timeControlMinutes": 10,
  "timeIncrementSeconds": 0
}

Response: 201 Created
{
  "data": {
    "_id": "68f160447450fcd51b2d76cf",
    "gameName": "Quick Match",
    "whitePlayer": "68f15d7c...",
    "status": "waiting",
    "currentPosition": "[null,null,null,null,null,null,null,null,null]",
    "currentTurn": "white",
    ...
  }
}
```

#### Join Game
```http
POST /games/:id/join
Authorization: Bearer {token}

Response: 200 OK
{
  "data": {
    "_id": "68f160447450fcd51b2d76cf",
    "status": "active",
    "blackPlayer": "68f15a7e...",
    "startedAt": "2025-10-16T21:14:44.220Z",
    ...
  }
}
```

#### Make Move
```http
POST /games/:id/move
Authorization: Bearer {token}
Content-Type: application/json

{
  "from": "0",
  "to": "4"
}

Response: 200 OK
{
  "data": {
    "_id": "68f160447450fcd51b2d76cf",
    "currentPosition": "[null,null,null,null,\"X\",null,null,null,null]",
    "currentTurn": "black",
    "moves": [...]
  }
}
```

#### Get Active Games
```http
GET /games
Authorization: Bearer {token}

Response: 200 OK
{
  "data": [
    {
      "_id": "...",
      "gameName": "Quick Match",
      "status": "waiting",
      "whitePlayer": { "username": "player1", "rating": 1200 }
    }
  ]
}
```

#### Random Matchmaking
```http
POST /games/random-match
Authorization: Bearer {token}

Response: 200 OK
{
  "data": {
    "_id": "...",
    "status": "active" or "waiting",
    ...
  }
}
```

#### Search Games
```http
GET /games/search?name=Quick
Authorization: Bearer {token}

Response: 200 OK
{
  "data": [ ... ]
}
```

### User Endpoints

#### Get Profile
```http
GET /users/profile
Authorization: Bearer {token}

Response: 200 OK
{
  "data": {
    "id": "68f15d7c...",
    "username": "player1",
    "email": "player1@example.com",
    "rating": 1200,
    "wins": 10,
    "losses": 5,
    "draws": 2,
    ...
  }
}
```

#### Update Profile
```http
PATCH /users/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "newusername"
}
```

#### Get User Stats
```http
GET /users/:id/stats
Authorization: Bearer {token}

Response: 200 OK
{
  "data": {
    "username": "player1",
    "rating": 1200,
    "gamesPlayed": 17,
    "wins": 10,
    "losses": 5,
    "draws": 2,
    "winRate": 58.82
  }
}
```

---

## 🔌 WebSocket Events

### Connection

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Client → Server Events

#### Join Game
```javascript
socket.emit('joinGame', { gameId: '68f160447450fcd51b2d76cf' });
```

#### Leave Game
```javascript
socket.emit('leaveGame', { gameId: '68f160447450fcd51b2d76cf' });
```

#### Make Move
```javascript
socket.emit('makeMove', {
  gameId: '68f160447450fcd51b2d76cf',
  move: { from: '0', to: '4' }
});
```

#### Send Message
```javascript
socket.emit('sendMessage', {
  gameId: '68f160447450fcd51b2d76cf',
  message: 'Good game!'
});
```

#### Request Draw
```javascript
socket.emit('requestDraw', { gameId: '68f160447450fcd51b2d76cf' });
```

#### Respond to Draw
```javascript
socket.emit('respondToDraw', {
  gameId: '68f160447450fcd51b2d76cf',
  accepted: true
});
```

### Server → Client Events

#### Game State
```javascript
socket.on('gameState', (game) => {
  console.log('Current game state:', game);
});
```

#### Game Updated
```javascript
socket.on('gameUpdated', (game) => {
  console.log('Game updated:', game);
  // Update UI with new game state
});
```

#### Game Ended
```javascript
socket.on('gameEnded', ({ result, winner }) => {
  console.log(`Game ended: ${result}, Winner: ${winner}`);
});
```

#### Player Joined
```javascript
socket.on('playerJoined', ({ userId, username }) => {
  console.log(`${username} joined the game`);
});
```

#### Player Left
```javascript
socket.on('playerLeft', ({ userId, username }) => {
  console.log(`${username} left the game`);
});
```

#### New Message
```javascript
socket.on('newMessage', ({ userId, username, message, timestamp }) => {
  console.log(`${username}: ${message}`);
});
```

#### Draw Requested
```javascript
socket.on('drawRequested', ({ fromUserId, fromUsername }) => {
  console.log(`${fromUsername} requested a draw`);
});
```

#### User Online/Offline
```javascript
socket.on('userOnline', ({ userId, username }) => {
  console.log(`${username} is online`);
});

socket.on('userOffline', ({ userId, username }) => {
  console.log(`${username} is offline`);
});
```

---

## 🎲 Game Logic

### Board Representation

The game board is a 3x3 grid stored as a JSON array:

```javascript
[
  null, null, null,  // Row 1: cells 0-2
  null, null, null,  // Row 2: cells 3-5
  null, null, null   // Row 3: cells 6-8
]

// After moves:
[
  "X", null, "O",    // Row 1
  null, "X", null,   // Row 2
  null, null, "O"    // Row 3
]
```

### Cell Indexing

```
0 | 1 | 2
---------
3 | 4 | 5
---------
6 | 7 | 8
```

### Win Conditions

The game checks 8 possible winning patterns:

```javascript
// Rows
[0, 1, 2], [3, 4, 5], [6, 7, 8]

// Columns
[0, 3, 6], [1, 4, 7], [2, 5, 8]

// Diagonals
[0, 4, 8], [2, 4, 6]
```

### Game Flow

1. **White player creates game** → Status: `waiting`
2. **Black player joins** → Status: `active`
3. **Players take turns**:
   - White = "X"
   - Black = "O"
4. **Win/Draw detection** → Status: `completed`
5. **Rating updates**:
   - Winner: +200 rating
   - Loser: -100 rating
   - Draw: no change

### Move Validation

- Cell must be empty (null)
- Must be player's turn
- Must be valid cell index (0-8)
- Game must be in progress

---

## 🧪 Testing

### Unit Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov
```

### E2E Tests

```bash
# Run end-to-end tests
npm run test:e2e
```

### Test Coverage

Current test coverage:
- **Auth Service**: 100%
- **Users Service**: 95%
- **Games Service**: 90%
- **Overall**: 21 tests passing

### Manual Testing

Use the included test script:

```bash
# Automated JWT auth testing
./test-jwt-auth.sh

# Manual API testing with curl
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"Test123!"}'
```

---

## 🚢 Deployment

### Docker Deployment

```bash
# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f

# Scale services
docker-compose up -d --scale app=3
```

### Production Checklist

- [ ] Change `JWT_SECRET` to a secure random string
- [ ] Set `NODE_ENV=production`
- [ ] Use strong MongoDB credentials
- [ ] Enable MongoDB authentication
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Set appropriate CORS origins
- [ ] Enable rate limiting
- [ ] Review security headers

### Environment-Specific Configs

**Development:**
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=mongodb://localhost:27017/lila_game
```

**Production:**
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=mongodb://admin:strongpass@mongo:27017/lila_game?authSource=admin
```

### PM2 Process Manager

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start dist/main.js --name lila-game

# View logs
pm2 logs lila-game

# Restart
pm2 restart lila-game

# Monitor
pm2 monit
```

---

## 🔧 Troubleshooting

### Port 3000 Already in Use

```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)

# Or use different port
PORT=3001 npm run start:dev
```

### MongoDB Connection Failed

```bash
# Check if MongoDB is running
docker-compose ps

# Start MongoDB
docker-compose up -d mongodb

# Check logs
docker-compose logs mongodb

# Verify connection string in .env
DATABASE_URL=mongodb://admin:password123@localhost:27017/lila_game?authSource=admin
```

### JWT Authentication Errors

**Error: "Unauthorized 401"**

Solution:
1. Check if token is being sent: `Authorization: Bearer {token}`
2. Verify JWT_SECRET matches between token generation and validation
3. Check token expiration
4. Ensure user exists in database

**Frontend not sending token:**

Check `src/services/api.ts`:
```javascript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Game ID Undefined Error

**Error: `Cast to ObjectId failed for value "undefined"`**

Solution:
1. Frontend must use `_id` field (not `id`)
2. Unwrap API responses: `response.data.data._id`
3. Check `types/index.ts` uses `_id: string`

### WebSocket Connection Issues

```bash
# Check if Socket.IO is enabled
curl http://localhost:3000/socket.io/?EIO=4&transport=polling

# Expected: Socket.IO handshake response
```

**Frontend connection:**
```javascript
// Correct
const socket = io('http://localhost:3000', {
  auth: { token: localStorage.getItem('token') }
});

// Incorrect
const socket = io('http://localhost:3000'); // No auth!
```

### Build Errors

```bash
# Clear build cache
rm -rf dist node_modules
npm install
npm run build

# Check TypeScript version
npm ls typescript
```

---

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- Use TypeScript strict mode
- Follow NestJS best practices
- Write unit tests for new features
- Use meaningful variable names
- Add JSDoc comments for complex functions
- Run `npm run lint` before committing

### Testing Guidelines

- Maintain > 80% code coverage
- Write both unit and E2E tests
- Test edge cases and error scenarios
- Mock external dependencies

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Pratham Nigam** - [GitHub](https://github.com/Pratham3232)

---

## 🙏 Acknowledgments

- NestJS team for the amazing framework
- MongoDB team for the database
- Socket.IO team for real-time capabilities
- React team for the frontend library
- All contributors and users

---

## 📞 Support

For issues and questions:
- **GitHub Issues**: [Create an issue](https://github.com/Pratham3232/Tic-tac-multiplayer-game/issues)
- **Email**: prathamnigam32@gmail.com

---

## 🔗 Useful Links

- [NestJS Documentation](https://docs.nestjs.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Socket.IO Documentation](https://socket.io/docs)
- [React Documentation](https://react.dev)
- [API Documentation](http://localhost:3000/api/docs) (when running)

---

**Made with ❤️ by Pratham Nigam**

**⭐ Star this repo if you find it helpful!**
