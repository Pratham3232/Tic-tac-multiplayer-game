# 🔐 MongoDB Authentication Error Fix

## Error
```
MongoServerError: Command find requires authentication
code: 13, codeName: 'Unauthorized'
```

## Solution

Your `.env` file has been updated with the correct MongoDB connection string.

### ✅ Fixed Configuration

```env
DATABASE_URL=mongodb://admin:password123@localhost:27017/lila_game?authSource=admin
```

This matches the MongoDB credentials in `docker-compose.yml`:
- **Username:** admin
- **Password:** password123
- **Database:** lila_game
- **Auth Source:** admin

## What to Do Now

### 1. Restart Your Backend
```bash
# Stop the current backend (Ctrl+C)
# Then restart:
npm run start:dev
```

### 2. Verify Connection
You should see:
```
✅ [Nest] INFO [MongooseModule] Mongoose connected to MongoDB
🚀 Application is running on: http://localhost:3000
```

### 3. Test Registration
Now try registering a user again - it should work! ✅

## Different MongoDB Setups

### Option 1: Docker Compose (Current Setup)
```env
DATABASE_URL=mongodb://admin:password123@localhost:27017/lila_game?authSource=admin
```

### Option 2: Local MongoDB (No Auth)
```env
DATABASE_URL=mongodb://localhost:27017/lila_game
```

### Option 3: MongoDB Atlas (Cloud)
```env
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/lila_game?retryWrites=true&w=majority
```

## Verify MongoDB is Running

```bash
# Check Docker containers
docker ps | grep mongo

# Should show:
# lila-game-mongodb
```

## Test Connection Manually

```bash
# Connect to MongoDB using mongosh
mongosh mongodb://admin:password123@localhost:27017/?authSource=admin

# You should be able to connect successfully
```

## Common Issues

### Issue 1: Wrong credentials
**Solution:** Make sure Docker Compose is using the same credentials:
```bash
docker-compose down
docker-compose up -d
```

### Issue 2: Database name mismatch
**Solution:** Both `.env` files should use `lila_game` (not `lila-game`)

### Issue 3: Auth source not specified
**Solution:** Add `?authSource=admin` to your connection string

## Quick Fix Checklist

- [x] ✅ Updated `.env` with authentication
- [ ] ⏳ Restart backend (`npm run start:dev`)
- [ ] ⏳ Test user registration
- [ ] ⏳ Verify you can create games

## Still Having Issues?

1. **Check MongoDB logs:**
   ```bash
   docker-compose logs mongodb
   ```

2. **Recreate MongoDB container:**
   ```bash
   docker-compose down -v
   docker-compose up -d mongodb
   ```

3. **Verify environment variables are loaded:**
   - Backend should show the correct DATABASE_URL on startup
   - Check there are no trailing spaces in `.env`

---

**Status:** ✅ Your `.env` file has been fixed!

**Next Step:** Restart your backend and try registering again.
