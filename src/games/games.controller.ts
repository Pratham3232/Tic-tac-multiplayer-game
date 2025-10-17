import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GamesService } from './games.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateGameDto, MakeMoveDto, GameResponseDto } from '../dto/game.dto';

@ApiTags('Games')
@Controller('games')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new game' })
  @ApiResponse({
    status: 201,
    description: 'Game successfully created',
    type: GameResponseDto,
  })
  async createGame(@Body() createGameDto: CreateGameDto, @Request() req) {
    return this.gamesService.createGame(createGameDto, req.user.id);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Join an existing game' })
  @ApiResponse({
    status: 200,
    description: 'Successfully joined the game',
    type: GameResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Game not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot join game (already full, wrong status, etc.)',
  })
  async joinGame(@Param('id') gameId: string, @Request() req) {
    return this.gamesService.joinGame(gameId, req.user.id);
  }

  @Post(':id/move')
  @ApiOperation({ summary: 'Make a move in the game' })
  @ApiResponse({
    status: 200,
    description: 'Move successfully made',
    type: GameResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Game not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid move or not your turn',
  })
  async makeMove(
    @Param('id') gameId: string,
    @Body() makeMoveDto: MakeMoveDto,
    @Request() req,
  ) {
    return this.gamesService.makeMove(gameId, makeMoveDto, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get game details' })
  @ApiResponse({
    status: 200,
    description: 'Game details retrieved successfully',
    type: GameResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Game not found',
  })
  async getGame(@Param('id') gameId: string) {
    return this.gamesService.getGame(gameId);
  }

  @Get()
  @ApiOperation({ summary: 'Get list of active games waiting for players' })
  @ApiResponse({
    status: 200,
    description: 'List of active games',
    type: [GameResponseDto],
  })
  async getActiveGames(@Query('search') search?: string) {
    if (search) {
      return this.gamesService.searchGamesByName(search);
    }
    return this.gamesService.getActiveGames();
  }

  @Post('random-match')
  @ApiOperation({ summary: 'Find and join a random match with similar rating' })
  @ApiResponse({
    status: 200,
    description: 'Random match found or created',
    type: GameResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'No suitable opponent found',
  })
  async findRandomMatch(@Request() req) {
    return this.gamesService.findRandomMatch(req.user.id);
  }

  @Get('user/history')
  @ApiOperation({ summary: 'Get user game history' })
  @ApiResponse({
    status: 200,
    description: 'User game history retrieved successfully',
    type: [GameResponseDto],
  })
  async getUserGames(@Request() req, @Query('limit') limit?: number) {
    return this.gamesService.getUserGames(req.user.id, limit);
  }

  @Post(':id/abandon')
  @ApiOperation({ summary: 'Abandon the game' })
  @ApiResponse({
    status: 200,
    description: 'Game abandoned successfully',
    type: GameResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Game not found',
  })
  @ApiResponse({
    status: 403,
    description: 'You are not a player in this game',
  })
  async abandonGame(@Param('id') gameId: string, @Request() req) {
    return this.gamesService.abandonGame(gameId, req.user.id);
  }
}