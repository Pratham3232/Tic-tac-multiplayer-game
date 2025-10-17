import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { GamesService } from '../games/games.service';
import { UsersService } from '../users/users.service';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, { userId: string; username: string }>();

  constructor(
    private jwtService: JwtService,
    private gamesService: GamesService,
    private usersService: UsersService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findById(payload.sub);
      
      if (!user) {
        client.disconnect();
        return;
      }

      this.connectedUsers.set(client.id, {
        userId: user.id,
        username: user.username,
      });

      // Update user's last seen
      await this.usersService.updateLastSeen(user.id);

      // Join user to their personal room for direct notifications
      client.join(`user_${user.id}`);

      console.log(`User ${user.username} connected with socket ${client.id}`);

      // Notify about online status
      this.server.emit('userOnline', {
        userId: user.id,
        username: user.username,
      });
    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user = this.connectedUsers.get(client.id);
    if (user) {
      console.log(`User ${user.username} disconnected`);
      this.connectedUsers.delete(client.id);
      
      // Notify about offline status
      this.server.emit('userOffline', {
        userId: user.userId,
        username: user.username,
      });
    }
  }

  @SubscribeMessage('joinGame')
  async handleJoinGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string },
  ) {
    const user = this.connectedUsers.get(client.id);
    if (!user) return;

    try {
      const game = await this.gamesService.getGame(data.gameId);
      
      // Join the game room
      client.join(`game_${data.gameId}`);
      
      // Notify other players in the game
      client.to(`game_${data.gameId}`).emit('playerJoined', {
        userId: user.userId,
        username: user.username,
      });
      
      // Send current game state to the joining player
      client.emit('gameState', game);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('leaveGame')
  handleLeaveGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string },
  ) {
    const user = this.connectedUsers.get(client.id);
    if (!user) return;

    client.leave(`game_${data.gameId}`);
    
    // Notify other players in the game
    client.to(`game_${data.gameId}`).emit('playerLeft', {
      userId: user.userId,
      username: user.username,
    });
  }

  @SubscribeMessage('makeMove')
  async handleMakeMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string; move: any },
  ) {
    const user = this.connectedUsers.get(client.id);
    if (!user) return;

    try {
      const updatedGame = await this.gamesService.makeMove(
        data.gameId,
        data.move,
        user.userId,
      );
      
      // Broadcast the updated game state to all players in the game
      this.server.to(`game_${data.gameId}`).emit('gameUpdated', updatedGame);
      
      // If game ended, broadcast the result
      if (updatedGame.status === 'completed') {
        this.server.to(`game_${data.gameId}`).emit('gameEnded', {
          result: updatedGame.result,
          winner: updatedGame.winner,
        });
      }
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('sendMessage')
  handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string; message: string },
  ) {
    const user = this.connectedUsers.get(client.id);
    if (!user) return;

    const chatMessage = {
      userId: user.userId,
      username: user.username,
      message: data.message,
      timestamp: new Date(),
    };

    // Broadcast the message to all players in the game
    this.server.to(`game_${data.gameId}`).emit('newMessage', chatMessage);
  }

  @SubscribeMessage('requestDraw')
  async handleRequestDraw(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string },
  ) {
    const user = this.connectedUsers.get(client.id);
    if (!user) return;

    // Notify the opponent about the draw request
    client.to(`game_${data.gameId}`).emit('drawRequested', {
      fromUserId: user.userId,
      fromUsername: user.username,
    });
  }

  @SubscribeMessage('respondToDraw')
  handleRespondToDraw(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string; accepted: boolean },
  ) {
    const user = this.connectedUsers.get(client.id);
    if (!user) return;

    if (data.accepted) {
      // Handle draw acceptance - update game status
      this.server.to(`game_${data.gameId}`).emit('drawAccepted');
      // You would also update the game in the database here
    } else {
      // Notify that draw was declined
      client.to(`game_${data.gameId}`).emit('drawDeclined', {
        byUserId: user.userId,
        byUsername: user.username,
      });
    }
  }

  // Method to send notifications to specific users
  async sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user_${userId}`).emit('notification', notification);
  }

  // Method to broadcast game updates
  async broadcastGameUpdate(gameId: string, update: any) {
    this.server.to(`game_${gameId}`).emit('gameUpdated', update);
  }
}