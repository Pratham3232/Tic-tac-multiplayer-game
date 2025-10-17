import { IsString, IsEnum, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PieceType, PieceColor, GameStatus, GameResult } from '../schemas/game.schema';

export class CreateGameDto {
  @ApiProperty({
    description: 'Optional name for the game',
    example: 'Quick Match',
    required: false,
  })
  @IsOptional()
  @IsString()
  gameName?: string;

  @ApiProperty({
    description: 'Initial time control in minutes',
    example: 10,
    minimum: 1,
    maximum: 180,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(180)
  timeControlMinutes?: number;

  @ApiProperty({
    description: 'Time increment per move in seconds',
    example: 0,
    minimum: 0,
    maximum: 60,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(60)
  timeIncrementSeconds?: number;
}

export class JoinGameDto {
  @ApiProperty({
    description: 'The ID of the game to join',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  gameId: string;
}

export class MakeMoveDto {
  @ApiProperty({
    description: 'The starting square of the move',
    example: 'e2',
  })
  @IsString()
  from: string;

  @ApiProperty({
    description: 'The destination square of the move',
    example: 'e4',
  })
  @IsString()
  to: string;

  @ApiProperty({
    description: 'The piece being moved',
    enum: PieceType,
    example: PieceType.PAWN,
  })
  @IsEnum(PieceType)
  piece: PieceType;

  @ApiProperty({
    description: 'Promotion piece type (if applicable)',
    enum: PieceType,
    required: false,
  })
  @IsOptional()
  @IsEnum(PieceType)
  promotion?: PieceType;
}

export class MoveResponseDto {
  @ApiProperty()
  from: string;

  @ApiProperty()
  to: string;

  @ApiProperty({ enum: PieceType })
  piece: PieceType;

  @ApiProperty({ enum: PieceColor })
  color: PieceColor;

  @ApiProperty({ required: false })
  captured?: PieceType;

  @ApiProperty()
  isCheck: boolean;

  @ApiProperty()
  isCheckmate: boolean;

  @ApiProperty()
  isCastling: boolean;

  @ApiProperty()
  isEnPassant: boolean;

  @ApiProperty({ required: false })
  promotion?: PieceType;

  @ApiProperty()
  algebraicNotation: string;

  @ApiProperty()
  timestamp: Date;
}

export class GameResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ required: false })
  gameName?: string;

  @ApiProperty()
  whitePlayer: string;

  @ApiProperty({ required: false })
  blackPlayer?: string;

  @ApiProperty({ enum: GameStatus })
  status: GameStatus;

  @ApiProperty({ enum: GameResult })
  result: GameResult;

  @ApiProperty({ type: [MoveResponseDto] })
  moves: MoveResponseDto[];

  @ApiProperty()
  currentPosition: string;

  @ApiProperty({ enum: PieceColor })
  currentTurn: PieceColor;

  @ApiProperty({ required: false })
  winner?: string;

  @ApiProperty()
  startedAt: Date;

  @ApiProperty({ required: false })
  endedAt?: Date;

  @ApiProperty()
  timeControlInitial: number;

  @ApiProperty()
  timeControlIncrement: number;

  @ApiProperty({ required: false })
  whiteTimeRemaining?: number;

  @ApiProperty({ required: false })
  blackTimeRemaining?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}