# Lila Game Backend

A comprehensive game backend API built with NestJS, MongoDB, and WebSocket support for real-time gaming experiences.

## 🎮 Full-Stack Solution

This is the **backend** part of the Lila Game project. For frontend implementation:
- 📖 See **[FRONTEND.md](FRONTEND.md)** for detailed frontend guide
- 🚀 Run `./setup-frontend.sh` to create a React frontend automatically
- 🌐 Compatible with React, Next.js, Vue, or any frontend framework

## Features

- **User Authentication**: JWT-based authentication with registration and login
- **User Management**: User profiles, statistics, friend system
- **Game Management**: Create, join, and play games with real-time updates
- **Real-time Communication**: WebSocket support for live game updates and chat
- **RESTful API**: Well-documented API endpoints with Swagger documentation
- **Validation & Error Handling**: Comprehensive input validation and error responses
- **Database Integration**: MongoDB with Mongoose ODM

## Tech Stack

- **Framework**: NestJS (Node.js)
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator & class-transformer
- **Testing**: Jest

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lila-game-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your configuration:
   ```
   DATABASE_URL=mongodb://localhost:27017/lila-game
   DATABASE_NAME=lila-game
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   PORT=3000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Start MongoDB**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

## Running the Application

### Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

### Debug Mode
```bash
npm run start:debug
```

The application will be available at:
- **API**: http://localhost:3000/api
- **Documentation**: http://localhost:3000/api/docs

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/profile` - Get current user profile
- `PATCH /api/users/profile` - Update user profile
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/:id/stats` - Get user statistics
- `POST /api/users/:id/friend` - Add friend
- `DELETE /api/users/:id/friend` - Remove friend

### Games
- `POST /api/games` - Create a new game
- `POST /api/games/:id/join` - Join a game
- `POST /api/games/:id/move` - Make a move
- `GET /api/games/:id` - Get game details
- `GET /api/games` - Get active games
- `GET /api/games/user/history` - Get user game history
- `POST /api/games/:id/abandon` - Abandon game

## WebSocket Events

### Client to Server
- `joinGame` - Join a game room
- `leaveGame` - Leave a game room
- `makeMove` - Make a move in the game
- `sendMessage` - Send chat message
- `requestDraw` - Request a draw
- `respondToDraw` - Respond to draw request

### Server to Client
- `gameState` - Current game state
- `gameUpdated` - Game state updated
- `gameEnded` - Game finished
- `playerJoined` - Player joined the game
- `playerLeft` - Player left the game
- `newMessage` - New chat message
- `drawRequested` - Draw request received
- `drawAccepted` - Draw accepted
- `drawDeclined` - Draw declined
- `userOnline` - User came online
- `userOffline` - User went offline
- `notification` - General notification

## Testing

### Run all tests
```bash
npm run test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run end-to-end tests
```bash
npm run test:e2e
```

### Generate test coverage
```bash
npm run test:cov
```

## API Documentation

Once the application is running, visit http://localhost:3000/api/docs to explore the interactive API documentation powered by Swagger.

## License

This project is licensed under the MIT License.
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
# Tic-tac-multiplayer-game
