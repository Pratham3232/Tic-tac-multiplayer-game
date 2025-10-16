import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'The username of the user',
    example: 'john_doe',
    minLength: 3,
    maxLength: 20,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The password for the user account',
    example: 'strongPassword123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
}

export class LoginDto {
  @ApiProperty({
    description: 'Username or email address',
    example: 'john_doe',
  })
  @IsString()
  usernameOrEmail: string;

  @ApiProperty({
    description: 'User password',
    example: 'strongPassword123',
  })
  @IsString()
  password: string;
}

export class UpdateUserDto {
  @ApiProperty({
    description: 'The username of the user',
    example: 'john_doe_updated',
    required: false,
    minLength: 3,
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username?: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'john.doe.updated@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;
}

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  gamesPlayed: number;

  @ApiProperty()
  gamesWon: number;

  @ApiProperty()
  gamesLost: number;

  @ApiProperty()
  gamesDrawn: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  lastSeen: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}