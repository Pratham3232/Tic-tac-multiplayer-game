# 🚀 Quick Start Guide

## Fastest Way to Get Started

### Option 1: Docker (Recommended) 🐳

```bash
# 1. Start all services (MongoDB + App + Mongo Express)
docker-compose up -d

# 2. View logs
docker-compose logs -f app

# 3. Access the application
# API: http://localhost:3000
# API Docs: http://localhost:3000/api
# Mongo Express: http://localhost:8081 (admin/admin123)
```

**That's it! Your app is running!** 🎉

### Option 2: Local Development 💻

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Start MongoDB (using Docker)
docker-compose up -d mongodb

# 4. Start the development server
npm run start:dev

# 5. Access the application
# API: http://localhost:3000
# API Docs: http://localhost:3000/api
```

## Testing Your Setup ✅

### 1. Check if server is running
```bash
curl http://localhost:3000
# Expected: "Lila Game API is running!"
```

### 2. View API Documentation
Open your browser: http://localhost:3000/api

### 3. Register a new user
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "player1",
    "email": "player1@example.com",
    "password": "password123"
  }'
```

### 4. Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "usernameOrEmail": "player1",
    "password": "password123"
  }'
```

Save the `accessToken` from the response!

### 5. Create a game
```bash
curl -X POST http://localhost:3000/games \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "timeControlMinutes": 10,
    "timeIncrementSeconds": 0
  }'
```

## Common Commands 📝

### Development
```bash
# Start development server with hot-reload
npm run start:dev

# Run in debug mode
npm run start:debug

# Build for production
npm run build

# Start production server
npm run start:prod
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm run test:cov

# Run E2E tests
npm run test:e2e
```

### Code Quality
```bash
# Lint code
npm run lint

# Format code
npm run format

# Check TypeScript compilation
npm run build
```

### Docker
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild services
docker-compose up -d --build

# Stop and remove volumes (clear database)
docker-compose down -v
```

### Database Management
```bash
# Access MongoDB shell
docker-compose exec mongodb mongosh -u admin -p password123

# Backup database
docker-compose exec mongodb mongodump --out /backup

# Restore database
docker-compose exec mongodb mongorestore /backup

# View database with Mongo Express
# Open http://localhost:8081
```

## Environment Variables 🔐

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/lila_game
JWT_SECRET=your-super-secret-jwt-key-change-me
JWT_EXPIRATION=7d
```

For Docker, the `.env` is already configured in `docker-compose.yml`.

## Troubleshooting 🔧

### Port 3000 already in use
```bash
# Find what's using the port
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 npm run start:dev
```

### MongoDB connection failed
```bash
# Make sure MongoDB is running
docker-compose ps

# Restart MongoDB
docker-compose restart mongodb

# Check MongoDB logs
docker-compose logs mongodb
```

### Tests failing
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Clear Jest cache
npm test -- --clearCache

# Run tests with verbose output
npm test -- --verbose
```

## What to Try First? 🎯

1. **View API Documentation**
   - Open http://localhost:3000/api
   - Explore all available endpoints
   - Try them directly in Swagger UI

2. **Register and Login**
   - Use the Swagger UI or curl
   - Get your JWT token
   - Test authenticated endpoints

3. **Create a Game**
   - Create a new game
   - Get the game ID
   - Try making moves

4. **Test WebSocket**
   - Open the WebSocket connection
   - Join a game room
   - Send real-time messages

5. **View Database**
   - Open http://localhost:8081
   - Login with admin/admin123
   - Browse your data

## Next Steps 📚

1. Read the [README.md](README.md) for detailed documentation
2. Check [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
3. Review [CONTRIBUTING.md](CONTRIBUTING.md) if you want to contribute
4. See [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) for complete feature list

## Quick Links 🔗

- **API Server:** http://localhost:3000
- **API Docs:** http://localhost:3000/api
- **Mongo Express:** http://localhost:8081
- **Repository:** [Your Git Repository URL]

## Support 💬

If you run into issues:
1. Check the [README.md](README.md) FAQ section
2. Review the [DEPLOYMENT.md](DEPLOYMENT.md) troubleshooting guide
3. Check application logs: `docker-compose logs -f app`
4. Check MongoDB logs: `docker-compose logs -f mongodb`

---

**Happy Coding!** 🎉

Remember: The Swagger UI at http://localhost:3000/api is your best friend for testing the API!