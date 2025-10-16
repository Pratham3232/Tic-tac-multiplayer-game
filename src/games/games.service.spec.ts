import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GamesService } from './games.service';
import { Game, GameDocument } from '../schemas/game.schema';
import { CreateGameDto, MakeMoveDto } from '../dto/game.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('GamesService', () => {
  let service: GamesService;
  let model: Model<GameDocument>;

  const mockGame = {
    _id: '507f1f77bcf86cd799439011',
    id: '507f1f77bcf86cd799439011',
    whitePlayer: '507f1f77bcf86cd799439012',
    blackPlayer: '507f1f77bcf86cd799439013',
    gameType: 'chess',
    status: 'in_progress',
    currentTurn: 'white',
    board: {},
    moveHistory: [],
    startTime: new Date(),
    timeControl: { type: 'blitz', minutes: 10, increment: 0 },
    createdAt: new Date(),
    updatedAt: new Date(),
    save: jest.fn().mockResolvedValue(this),
  };

  const mockGameModel = {
    new: jest.fn().mockResolvedValue(mockGame),
    constructor: jest.fn().mockResolvedValue(mockGame),
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    exec: jest.fn(),
    save: jest.fn().mockResolvedValue(mockGame),
  };

  const mockUserModel = {
    findById: jest.fn(),
    findOne: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamesService,
        {
          provide: getModelToken(Game.name),
          useValue: mockGameModel,
        },
        {
          provide: getModelToken('User'),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<GamesService>(GamesService);
    model = module.get<Model<GameDocument>>(getModelToken(Game.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getGame', () => {
    it('should return a game if found', async () => {
      mockGameModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockGame),
      });

      const result = await service.getGame('507f1f77bcf86cd799439011');
      expect(result).toEqual(mockGame);
    });

    it('should throw NotFoundException if game not found', async () => {
      mockGameModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.getGame('507f1f77bcf86cd799439011')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getActiveGames', () => {
    it('should return all active games', async () => {
      const mockGames = [mockGame, { ...mockGame, _id: '507f1f77bcf86cd799439014' }];
      mockGameModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockGames),
      });

      const result = await service.getActiveGames();
      expect(result).toEqual(mockGames);
    });
  });

  describe('getUserGames', () => {
    it('should return all games for a user', async () => {
      const userId = '507f1f77bcf86cd799439012';
      const mockGames = [mockGame];
      mockGameModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockGames),
      });

      const result = await service.getUserGames(userId);
      expect(result).toEqual(mockGames);
      expect(mockGameModel.find).toHaveBeenCalledWith({
        $or: [{ whitePlayer: userId }, { blackPlayer: userId }],
      });
    });
  });

  describe('joinGame', () => {
    it('should allow a player to join a waiting game', async () => {
      const waitingGame = { ...mockGame, status: 'waiting', blackPlayer: null, save: jest.fn().mockResolvedValue(mockGame) };
      mockGameModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(waitingGame),
      });

      const result = await service.joinGame('507f1f77bcf86cd799439011', '507f1f77bcf86cd799439013');
      expect(waitingGame.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if game is not waiting', async () => {
      mockGameModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockGame),
      });

      await expect(service.joinGame('507f1f77bcf86cd799439011', '507f1f77bcf86cd799439013')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});