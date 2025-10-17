import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type GameDocument = Game & Document;

export enum GameStatus {
  WAITING = 'waiting',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
}

export enum GameResult {
  WHITE_WINS = 'white_wins',
  BLACK_WINS = 'black_wins',
  DRAW = 'draw',
  ONGOING = 'ongoing',
}

export enum PieceType {
  PAWN = 'pawn',
  ROOK = 'rook',
  KNIGHT = 'knight',
  BISHOP = 'bishop',
  QUEEN = 'queen',
  KING = 'king',
}

export enum PieceColor {
  WHITE = 'white',
  BLACK = 'black',
}

@Schema()
export class Move {
  @Prop({ required: true })
  from: string; // For tic-tac-toe: cell index as string

  @Prop({ required: true })
  to: string; // For tic-tac-toe: cell index as string

  @Prop({ required: true })
  piece: string; // For tic-tac-toe: 'X' or 'O'

  @Prop({ required: true, enum: PieceColor })
  color: PieceColor;

  @Prop()
  captured?: PieceType;

  @Prop({ default: false })
  isCheck: boolean;

  @Prop({ default: false })
  isCheckmate: boolean;

  @Prop({ default: false })
  isCastling: boolean;

  @Prop({ default: false })
  isEnPassant: boolean;

  @Prop()
  promotion?: PieceType;

  @Prop({ required: true })
  algebraicNotation: string; // For tic-tac-toe: 'X → Cell 1', etc.

  @Prop({ default: Date.now })
  timestamp: Date;
}

export const MoveSchema = SchemaFactory.createForClass(Move);

@Schema({ timestamps: true })
export class Game {
  @Prop({ type: String })
  gameName?: string;

  @Prop({ type: Boolean, default: false })
  isRandomMatch?: boolean;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  whitePlayer: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  blackPlayer?: Types.ObjectId;

  @Prop({ required: true, enum: GameStatus, default: GameStatus.WAITING })
  status: GameStatus;

  @Prop({ required: true, enum: GameResult, default: GameResult.ONGOING })
  result: GameResult;

  @Prop({ type: [MoveSchema], default: [] })
  moves: Move[];

  @Prop({ required: true, default: '[]' })
  currentPosition: string; // JSON array of 9 cells for tic-tac-toe

  @Prop({ required: true, enum: PieceColor, default: PieceColor.WHITE })
  currentTurn: PieceColor;

  @Prop()
  winner?: Types.ObjectId;

  @Prop({ default: Date.now })
  startedAt: Date;

  @Prop()
  endedAt?: Date;

  @Prop({ default: 10 * 60 * 1000 }) // 10 minutes in milliseconds
  timeControlInitial: number;

  @Prop({ default: 0 })
  timeControlIncrement: number;

  @Prop()
  whiteTimeRemaining: number;

  @Prop()
  blackTimeRemaining: number;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const GameSchema = SchemaFactory.createForClass(Game);
