# 🔧 MongoDB Connection Error - Quick Fix

## Error
```
MongooseServerSelectionError: connect ECONNREFUSED ::1:27017
```

This means MongoDB is not running. Here are the solutions:

## Solution 1: Start MongoDB with Docker (Recommended) 🐳

### Step 1: Make sure Docker Desktop is running
1. Open **Docker Desktop** application on your Mac
2. Wait for it to start (you'll see the whale icon in the menu bar)

### Step 2: Start MongoDB
```bash
cd /Users/prathamnigam/lila-game-project
docker-compose up -d mongodb
```

### Step 3: Verify MongoDB is running
```bash
docker ps
# You should see mongodb container running
```

### Step 4: Check MongoDB logs (optional)
```bash
docker-compose logs mongodb
```

## Solution 2: Install MongoDB Locally (Alternative)

If you don't want to use Docker:

### Install MongoDB with Homebrew
```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community@7.0

# Start MongoDB
brew services start mongodb-community@7.0

# Verify it's running
brew services list | grep mongodb
```

## Solution 3: Use MongoDB Atlas (Cloud) ☁️

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a free cluster
4. Get your connection string
5. Update your `.env` file:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lila_game?retryWrites=true&w=majority
```

## Quick Fix Commands

```bash
# If Docker Desktop is installed but not running:
open -a Docker

# Wait 30 seconds for Docker to start, then:
cd /Users/prathamnigam/lila-game-project
docker-compose up -d mongodb

# Restart your backend
npm run start:dev
```

## Verify Everything is Working

After starting MongoDB, you should see:
```bash
[Nest] INFO [MongooseModule] Mongoose connected to MongoDB
```

## Check Your Connection String

Make sure your `.env` file has:
```env
MONGODB_URI=mongodb://localhost:27017/lila_game
# OR if using Docker with auth:
MONGODB_URI=mongodb://admin:password123@localhost:27017/lila_game?authSource=admin
```

## Test MongoDB Connection

```bash
# Test if MongoDB is accessible
nc -zv localhost 27017
# Should say: Connection to localhost port 27017 [tcp/*] succeeded!

# Or using mongosh
mongosh mongodb://localhost:27017
```

## Common Issues

### Issue 1: Docker Desktop not installed
**Solution:** Download from https://www.docker.com/products/docker-desktop

### Issue 2: Port 27017 already in use
**Solution:** 
```bash
# Find what's using the port
lsof -i :27017

# Kill the process
kill -9 <PID>
```

### Issue 3: Wrong connection string
**Solution:** Check your `.env` file matches your setup

## Recommended: Use Docker Compose for Everything

Start all services at once:
```bash
cd /Users/prathamnigam/lila-game-project

# Start everything (MongoDB + App + Mongo Express)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop everything
docker-compose down
```

This gives you:
- ✅ MongoDB on port 27017
- ✅ Backend on port 3000
- ✅ Mongo Express UI on port 8081

---

**Quick Fix (Most Common):**
1. Open Docker Desktop
2. Wait 30 seconds
3. Run: `docker-compose up -d mongodb`
4. Restart your backend
5. ✅ Done!
