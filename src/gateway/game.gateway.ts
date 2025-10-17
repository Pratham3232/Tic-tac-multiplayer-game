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

      await this.usersService.updateLastSeen(user.id);
      client.join(`user_${user.id}`);

      this.server.emit('userOnline', {
        userId: user.id,
        username: user.username,
      });
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user = this.connectedUsers.get(client.id);
    if (user) {
      this.connectedUsers.delete(client.id);
      
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
      
      client.join(`game_${data.gameId}`);
      
      client.to(`game_${data.gameId}`).emit('playerJoined', {
        userId: user.userId,
        username: user.username,
      });
      
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
      
      const populatedGame = await this.gamesService.getGame(data.gameId);
      
      this.server.in(`game_${data.gameId}`).emit('gameUpdated', populatedGame);
      
      if (populatedGame.status === 'completed') {
        this.server.in(`game_${data.gameId}`).emit('gameEnded', {
          result: populatedGame.result,
          winner: populatedGame.winner,
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

    this.server.to(`game_${data.gameId}`).emit('newMessage', chatMessage);
  }

  @SubscribeMessage('requestDraw')
  async handleRequestDraw(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string },
  ) {
    const user = this.connectedUsers.get(client.id);
    if (!user) return;

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
      this.server.to(`game_${data.gameId}`).emit('drawAccepted');
    } else {
      client.to(`game_${data.gameId}`).emit('drawDeclined', {
        byUserId: user.userId,
        byUsername: user.username,
      });
    }
  }

  async sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user_${userId}`).emit('notification', notification);
  }

  async broadcastGameUpdate(gameId: string, update: any) {
    this.server.to(`game_${gameId}`).emit('gameUpdated', update);
  }
}