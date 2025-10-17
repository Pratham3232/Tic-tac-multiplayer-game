import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Game, GameDocument, GameStatus, GameResult, PieceColor, Move } from '../schemas/game.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateGameDto, MakeMoveDto } from '../dto/game.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class GamesService {
  constructor(
    @InjectModel(Game.name) private gameModel: Model<GameDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private usersService: UsersService,
  ) {}

  async createGame(createGameDto: CreateGameDto, whitePlayerId: string): Promise<GameDocument> {
    const game = new this.gameModel({
      gameName: createGameDto.gameName,
      whitePlayer: whitePlayerId,
      status: GameStatus.WAITING,
      result: GameResult.ONGOING,
      currentPosition: JSON.stringify(Array(9).fill(null)),
      currentTurn: PieceColor.WHITE,
      timeControlInitial: (createGameDto.timeControlMinutes || 10) * 60 * 1000,
      timeControlIncrement: (createGameDto.timeIncrementSeconds || 0) * 1000,
      whiteTimeRemaining: (createGameDto.timeControlMinutes || 10) * 60 * 1000,
      blackTimeRemaining: (createGameDto.timeControlMinutes || 10) * 60 * 1000,
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

  async makeMove(gameId: string, makeMoveDto: any, playerId: string): Promise<GameDocument> {
    const game = await this.gameModel.findById(gameId).exec();
    
    if (!game) {
      throw new NotFoundException('Game not found');
    }
    
    if (game.status !== GameStatus.IN_PROGRESS) {
      throw new BadRequestException('Game is not in progress');
    }
    
    const playerColor = game.whitePlayer.toString() === playerId ? PieceColor.WHITE : PieceColor.BLACK;
    
    if (game.blackPlayer?.toString() !== playerId && game.whitePlayer.toString() !== playerId) {
      throw new ForbiddenException('You are not a player in this game');
    }
    
    if (game.currentTurn !== playerColor) {
      throw new BadRequestException('It is not your turn');
    }
    
    let board: (string | null)[];
    try {
      board = JSON.parse(game.currentPosition);
    } catch (error) {
      board = Array(9).fill(null);
    }
    
    const cellIndex = parseInt(makeMoveDto.to);
    
    if (isNaN(cellIndex) || cellIndex < 0 || cellIndex > 8) {
      throw new BadRequestException('Invalid cell index');
    }
    
    if (board[cellIndex]) {
      throw new BadRequestException('Cell is already occupied');
    }
    
    const symbol = playerColor === PieceColor.WHITE ? 'X' : 'O';
    
    board[cellIndex] = symbol;
    
    const move: Move = {
      from: makeMoveDto.from,
      to: makeMoveDto.to,
      piece: symbol as any,
      color: playerColor,
      algebraicNotation: `${symbol} → Cell ${cellIndex + 1}`,
      timestamp: new Date(),
      isCheck: false,
      isCheckmate: false,
      isCastling: false,
      isEnPassant: false,
    };
    
    game.moves.push(move);
    game.currentPosition = JSON.stringify(board);
    
    const winResult = this.checkWin(board);
    if (winResult.winner) {
      game.status = GameStatus.COMPLETED;
      game.result = winResult.winner === 'X' ? GameResult.WHITE_WINS : GameResult.BLACK_WINS;
      game.winner = playerId as any;
      game.endedAt = new Date();
      
      const winnerId = playerId;
      const loserId = winnerId === game.whitePlayer.toString() 
        ? game.blackPlayer?.toString() 
        : game.whitePlayer.toString();
      
      await this.usersService.updateRating(winnerId, 200);
      if (loserId) {
        await this.usersService.updateRating(loserId, -100);
      }
    } else if (winResult.draw) {
      game.status = GameStatus.COMPLETED;
      game.result = GameResult.DRAW;
      game.endedAt = new Date();
    } else {
      game.currentTurn = game.currentTurn === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
    }
    
    return game.save();
  }

  private checkWin(board: (string | null)[]): { winner: string | null; draw: boolean } {
    const winPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    
    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], draw: false };
      }
    }
    
    const isFull = board.every(cell => cell !== null);
    if (isFull) {
      return { winner: null, draw: true };
    }
    
    return { winner: null, draw: false };
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
      .find({ 
        status: GameStatus.WAITING,
        isRandomMatch: { $ne: true }
      })
      .populate('whitePlayer', 'username rating')
      .sort({ createdAt: -1 })
      .limit(20)
      .exec();
  }

  async getUserGames(userId: string, limit: number = 20): Promise<GameDocument[]> {
    return this.gameModel
      .find({
        $or: [{ whitePlayer: userId }, { blackPlayer: userId }],
        status: { $in: [GameStatus.COMPLETED, GameStatus.ABANDONED] }
      })
      .populate('whitePlayer', 'username rating')
      .populate('blackPlayer', 'username rating')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async searchGamesByName(searchTerm: string): Promise<GameDocument[]> {
    return this.gameModel
      .find({
        gameName: { $regex: searchTerm, $options: 'i' },
        status: GameStatus.WAITING
      })
      .populate('whitePlayer', 'username rating')
      .populate('blackPlayer', 'username rating')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findRandomMatch(userId: string): Promise<GameDocument> {
    const currentUser = await this.usersService.findById(userId);
    const userRating = currentUser.rating || 1200;

    const waitingGame = await this.gameModel
      .findOne({
        status: GameStatus.WAITING,
        isRandomMatch: true,
        blackPlayer: null,
        whitePlayer: { $ne: userId },
      })
      .populate('whitePlayer', 'username rating')
      .exec();

    if (waitingGame) {
      const opponentRating = typeof waitingGame.whitePlayer === 'object' 
        ? (waitingGame.whitePlayer as any).rating || 1200 
        : 1200;

      if (Math.abs(userRating - opponentRating) <= 100) {
        const gameId = (waitingGame as any)._id.toString();
        return this.joinGame(gameId, userId);
      }
    }

    const game = new this.gameModel({
      gameName: 'Random Match',
      isRandomMatch: true,
      whitePlayer: userId,
      status: GameStatus.WAITING,
      result: GameResult.ONGOING,
      currentPosition: JSON.stringify(Array(9).fill(null)),
      currentTurn: PieceColor.WHITE,
      timeControlInitial: 10 * 60 * 1000,
      timeControlIncrement: 0,
      whiteTimeRemaining: 10 * 60 * 1000,
      blackTimeRemaining: 10 * 60 * 1000,
    });

    return game.save();
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
