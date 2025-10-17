# Lila Game Backend - Deployment Guide

This guide covers different deployment strategies for the Lila Game Backend application.

## Table of Contents
- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)
- [Production Deployment](#production-deployment)
- [Environment Variables](#environment-variables)
- [Health Checks](#health-checks)

## Local Development

### Prerequisites
- Node.js 20.x or higher
- MongoDB 7.x or higher
- npm or yarn

### Setup

1. **Clone the repository** (if applicable)
```bash
git clone <repository-url>
cd lila-game-project
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/lila_game
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=7d
```

4. **Start MongoDB**
```bash
# Using MongoDB installed locally
mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:7
```

5. **Run the application**
```bash
# Development mode with hot-reload
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`
API documentation at `http://localhost:3000/api`

## Docker Deployment

### Using Docker Compose (Recommended)

The easiest way to run the application with all dependencies:

```bash
# Start all services (app, MongoDB, Mongo Express)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (clears database)
docker-compose down -v
```

**Services:**
- **App**: `http://localhost:3000`
- **API Docs**: `http://localhost:3000/api`
- **MongoDB**: `localhost:27017`
- **Mongo Express** (DB UI): `http://localhost:8081` (admin/admin123)

### Using Docker Manually

Build and run the Docker image:

```bash
# Build the image
docker build -t lila-game-backend .

# Run the container
docker run -d \
  -p 3000:3000 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/lila_game \
  -e JWT_SECRET=your-secret-key \
  --name lila-game-app \
  lila-game-backend
```

## Production Deployment

### Prerequisites
- Domain name (optional but recommended)
- SSL certificate (Let's Encrypt recommended)
- Production MongoDB instance (MongoDB Atlas, AWS DocumentDB, etc.)

### Environment Configuration

Create a `.env.production` file:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lila_game?retryWrites=true&w=majority
JWT_SECRET=<generate-a-strong-random-secret>
JWT_EXPIRATION=7d
CORS_ORIGIN=https://yourdomain.com
```

**Generate a strong JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Deployment Options

#### Option 1: Traditional Server (VM/VPS)

1. **Install dependencies on server:**
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2
```

2. **Deploy application:**
```bash
# Build the application
npm run build

# Start with PM2
pm2 start dist/main.js --name lila-game-backend

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

3. **Setup Nginx as reverse proxy:**
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

4. **Setup SSL with Let's Encrypt:**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

#### Option 2: Docker Deployment on Server

1. **Install Docker:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER
```

2. **Deploy with Docker Compose:**
```bash
# Upload your docker-compose.yml and .env.production
docker-compose --env-file .env.production up -d
```

#### Option 3: Cloud Platforms

**Heroku:**
```bash
# Install Heroku CLI
# Login
heroku login

# Create app
heroku create lila-game-backend

# Add MongoDB (using MongoDB Atlas or mLab addon)
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set JWT_SECRET=your-secret-key
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

**AWS (Elastic Beanstalk):**
```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init

# Create environment
eb create production

# Deploy
eb deploy
```

**DigitalOcean App Platform:**
- Connect your GitHub repository
- Set environment variables in the dashboard
- Deploy automatically on git push

**Railway:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and initialize
railway login
railway init

# Add environment variables
railway variables set JWT_SECRET=your-secret-key

# Deploy
railway up
```

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment (development/production) | development | Yes |
| `PORT` | Server port | 3000 | Yes |
| `MONGODB_URI` | MongoDB connection string | - | Yes |
| `JWT_SECRET` | Secret for JWT signing | - | Yes |
| `JWT_EXPIRATION` | JWT token expiration time | 7d | No |
| `CORS_ORIGIN` | Allowed CORS origins | * | No |

## Health Checks

The application provides health check endpoints for monitoring:

### Basic Health Check
```bash
curl http://localhost:3000/
# Response: "Lila Game API is running!"
```

### Database Connection Check
```bash
curl http://localhost:3000/health
# Response: { "status": "ok", "database": "connected" }
```

## Monitoring and Logging

### PM2 Monitoring
```bash
# View logs
pm2 logs lila-game-backend

# Monitor resources
pm2 monit

# View status
pm2 status
```

### Docker Logs
```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f app
```

## Backup and Restore

### MongoDB Backup
```bash
# Backup
mongodump --uri="your-mongodb-uri" --out=/backup/$(date +%Y%m%d)

# Restore
mongorestore --uri="your-mongodb-uri" /backup/20241016
```

## Scaling

### Horizontal Scaling
```bash
# Using PM2 cluster mode
pm2 start dist/main.js -i max --name lila-game-backend

# Using Docker Compose
docker-compose up -d --scale app=3
```

### Load Balancing
Use Nginx or a cloud load balancer to distribute traffic across multiple instances.

## Security Checklist

- [ ] Use strong JWT secrets (32+ random characters)
- [ ] Enable HTTPS/SSL in production
- [ ] Set appropriate CORS origins
- [ ] Use environment variables for secrets
- [ ] Enable MongoDB authentication
- [ ] Implement rate limiting
- [ ] Keep dependencies updated
- [ ] Use security headers (Helmet.js)
- [ ] Implement input validation
- [ ] Regular security audits (`npm audit`)

## Troubleshooting

### Common Issues

**MongoDB Connection Failed:**
```bash
# Check MongoDB is running
sudo systemctl status mongod

# Check connection string
echo $MONGODB_URI
```

**Port Already in Use:**
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

**JWT Verification Failed:**
- Ensure JWT_SECRET is the same across all instances
- Check token expiration settings

## Performance Optimization

1. **Enable caching** for frequently accessed data
2. **Use indexes** in MongoDB for better query performance
3. **Implement connection pooling** for database connections
4. **Use compression** middleware for responses
5. **Enable gzip** in Nginx
6. **Implement CDN** for static assets

## Support

For issues or questions:
- Check the main [README.md](README.md)
- Review API documentation at `/api`
- Check application logs