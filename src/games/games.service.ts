import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Game, GameDocument, GameStatus, GameResult, PieceColor, Move } from '../schemas/game.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateGameDto, MakeMoveDto } from '../dto/game.dto';

@Injectable()
export class GamesService {
  constructor(
    @InjectModel(Game.name) private gameModel: Model<GameDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async createGame(createGameDto: CreateGameDto, whitePlayerId: string): Promise<GameDocument> {
    const timeControlMinutes = createGameDto.timeControlMinutes || 10;
    const timeIncrementSeconds = createGameDto.timeIncrementSeconds || 0;
    
    const timeControlInitial = timeControlMinutes * 60 * 1000; // Convert to milliseconds
    const timeControlIncrement = timeIncrementSeconds * 1000; // Convert to milliseconds
    
    const game = new this.gameModel({
      whitePlayer: whitePlayerId,
      timeControlInitial,
      timeControlIncrement,
      whiteTimeRemaining: timeControlInitial,
      blackTimeRemaining: timeControlInitial,
    });
    
    return game.save();
  }

  async joinGame(gameId: string, blackPlayerId: string): Promise<GameDocument> {
    const game = await this.gameModel.findById(gameId).exec();
    
    if (!game) {
      throw new NotFoundException('Game not found');
    }
    
    if (game.status !== GameStatus.WAITING) {
      throw new BadRequestException('Game is not available to join');
    }
    
    if (game.whitePlayer.toString() === blackPlayerId) {
      throw new BadRequestException('You cannot play against yourself');
    }
    
    if (game.blackPlayer) {
      throw new BadRequestException('Game is already full');
    }
    
    game.blackPlayer = blackPlayerId as any;
    game.status = GameStatus.IN_PROGRESS;
    game.startedAt = new Date();
    
    return game.save();
  }

  async makeMove(gameId: string, makeMoveDto: MakeMoveDto, playerId: string): Promise<GameDocument> {
    const game = await this.gameModel.findById(gameId).exec();
    
    if (!game) {
      throw new NotFoundException('Game not found');
    }
    
    if (game.status !== GameStatus.IN_PROGRESS) {
      throw new BadRequestException('Game is not in progress');
    }
    
    // Determine player's color
    const playerColor = game.whitePlayer.toString() === playerId ? PieceColor.WHITE : PieceColor.BLACK;
    
    if (game.blackPlayer?.toString() !== playerId && game.whitePlayer.toString() !== playerId) {
      throw new ForbiddenException('You are not a player in this game');
    }
    
    if (game.currentTurn !== playerColor) {
      throw new BadRequestException('It is not your turn');
    }
    
    // Create the move (this is a simplified version - in a real chess game, you'd validate the move)
    const move: Move = {
      from: makeMoveDto.from,
      to: makeMoveDto.to,
      piece: makeMoveDto.piece,
      color: playerColor,
      algebraicNotation: `${makeMoveDto.piece === 'pawn' ? '' : makeMoveDto.piece.charAt(0).toUpperCase()}${makeMoveDto.to}`,
      timestamp: new Date(),
      isCheck: false, // Would be calculated based on game logic
      isCheckmate: false, // Would be calculated based on game logic
      isCastling: false, // Would be detected based on move
      isEnPassant: false, // Would be detected based on move
      promotion: makeMoveDto.promotion,
    };
    
    // Add move to game
    game.moves.push(move);
    
    // Switch turns
    game.currentTurn = game.currentTurn === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
    
    // Update position (simplified - in a real game, this would be calculated)
    // For now, we'll just increment the move counter in FEN
    const fenParts = game.currentPosition.split(' ');
    const fullMoveNumber = parseInt(fenParts[5]) + (playerColor === PieceColor.BLACK ? 1 : 0);
    fenParts[1] = game.currentTurn === PieceColor.WHITE ? 'w' : 'b';
    fenParts[5] = fullMoveNumber.toString();
    game.currentPosition = fenParts.join(' ');
    
    // Check for game end conditions (simplified)
    if (move.isCheckmate) {
      game.status = GameStatus.COMPLETED;
      game.result = playerColor === PieceColor.WHITE ? GameResult.WHITE_WINS : GameResult.BLACK_WINS;
      game.winner = playerId as any;
      game.endedAt = new Date();
    }
    
    return game.save();
  }

  async getGame(gameId: string): Promise<GameDocument> {
    const game = await this.gameModel
      .findById(gameId)
      .populate('whitePlayer', 'username rating')
      .populate('blackPlayer', 'username rating')
      .exec();
    
    if (!game) {
      throw new NotFoundException('Game not found');
    }
    
    return game;
  }

  async getActiveGames(): Promise<GameDocument[]> {
    return this.gameModel
      .find({ status: GameStatus.WAITING })
      .populate('whitePlayer', 'username rating')
      .sort({ createdAt: -1 })
      .limit(20)
      .exec();
  }

  async getUserGames(userId: string, limit = 10): Promise<GameDocument[]> {
    return this.gameModel
      .find({
        $or: [
          { whitePlayer: userId },
          { blackPlayer: userId },
        ],
      })
      .populate('whitePlayer', 'username rating')
      .populate('blackPlayer', 'username rating')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async abandonGame(gameId: string, playerId: string): Promise<GameDocument> {
    const game = await this.gameModel.findById(gameId).exec();
    
    if (!game) {
      throw new NotFoundException('Game not found');
    }
    
    if (game.whitePlayer.toString() !== playerId && game.blackPlayer?.toString() !== playerId) {
      throw new ForbiddenException('You are not a player in this game');
    }
    
    if (game.status === GameStatus.COMPLETED) {
      throw new BadRequestException('Game is already completed');
    }
    
    game.status = GameStatus.ABANDONED;
    game.endedAt = new Date();
    
    // Determine winner (the other player)
    if (game.whitePlayer.toString() === playerId) {
      game.result = GameResult.BLACK_WINS;
      game.winner = game.blackPlayer as any;
    } else {
      game.result = GameResult.WHITE_WINS;
      game.winner = game.whitePlayer;
    }
    
    return game.save();
  }
}