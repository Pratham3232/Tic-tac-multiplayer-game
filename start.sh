#!/bin/bash

# 🚀 Lila Game - Complete Startup Script
# This script starts both backend and frontend

echo "🎮 Starting Lila Game Platform..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running!${NC}"
    echo "   Please start Docker Desktop and try again."
    echo ""
    echo "   On macOS: open -a Docker"
    exit 1
fi

echo -e "${GREEN}✅ Docker is running${NC}"

# Start MongoDB
echo ""
echo "📦 Starting MongoDB..."
cd /Users/prathamnigam/lila-game-project
docker-compose up -d mongodb

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
sleep 5

# Check if MongoDB is running
if docker ps | grep -q lila-game-mongodb; then
    echo -e "${GREEN}✅ MongoDB is running${NC}"
else
    echo -e "${RED}❌ Failed to start MongoDB${NC}"
    exit 1
fi

# Start Backend
echo ""
echo "🔧 Starting Backend (NestJS)..."
echo "   Backend will run on: http://localhost:3000"
echo "   API Docs: http://localhost:3000/api/docs"
echo ""

# Open new terminal window for backend
osascript -e 'tell application "Terminal"
    do script "cd /Users/prathamnigam/lila-game-project && npm run start:dev"
end tell'

# Wait a bit for backend to start
sleep 3

# Start Frontend
echo ""
echo "🎨 Starting Frontend (React)..."
echo "   Frontend will run on: http://localhost:5173"
echo ""

# Open new terminal window for frontend
osascript -e 'tell application "Terminal"
    do script "cd /Users/prathamnigam/lila-game-frontend && npm run dev"
end tell'

# Wait a bit
sleep 3

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 Lila Game Platform Started!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📍 URLs:"
echo "   Frontend:    http://localhost:5173"
echo "   Backend:     http://localhost:3000"
echo "   API Docs:    http://localhost:3000/api/docs"
echo "   Mongo UI:    http://localhost:8081 (admin/admin123)"
echo ""
echo "🎮 What to do next:"
echo "   1. Open http://localhost:5173"
echo "   2. Register a new account"
echo "   3. Create or join a game"
echo "   4. Start playing chess!"
echo ""
echo "💡 Tip: Check the new terminal windows for backend and frontend logs"
echo ""

# Optionally open browser
read -p "Open frontend in browser? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    sleep 2
    open http://localhost:5173
fi

echo ""
echo "✅ Done! Happy gaming! 🎮♟️"
