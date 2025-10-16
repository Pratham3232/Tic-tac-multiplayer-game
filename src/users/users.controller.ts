import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateUserDto, UserResponseDto } from '../dto/user.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserResponseDto,
  })
  async getProfile(@Request() req) {
    return this.usersService.findById(req.user.id);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
    type: UserResponseDto,
  })
  async updateProfile(@Body() updateUserDto: UpdateUserDto, @Request() req) {
    return this.usersService.update(req.user.id, updateUserDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getUserById(@Param('id') userId: string) {
    return this.usersService.findById(userId);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get user game statistics' })
  @ApiResponse({
    status: 200,
    description: 'User statistics retrieved successfully',
  })
  async getUserStats(@Param('id') userId: string) {
    const user = await this.usersService.findById(userId);
    return {
      gamesPlayed: user.gamesPlayed,
      gamesWon: user.gamesWon,
      gamesLost: user.gamesLost,
      gamesDrawn: user.gamesDrawn,
      rating: user.rating,
      winRate: user.gamesPlayed > 0 ? (user.gamesWon / user.gamesPlayed) * 100 : 0,
    };
  }

  @Post(':id/friend')
  @ApiOperation({ summary: 'Add user as friend' })
  @ApiResponse({
    status: 200,
    description: 'Friend added successfully',
  })
  async addFriend(@Param('id') friendId: string, @Request() req) {
    await this.usersService.addFriend(req.user.id, friendId);
    return { message: 'Friend added successfully' };
  }

  @Delete(':id/friend')
  @ApiOperation({ summary: 'Remove user from friends' })
  @ApiResponse({
    status: 200,
    description: 'Friend removed successfully',
  })
  async removeFriend(@Param('id') friendId: string, @Request() req) {
    await this.usersService.removeFriend(req.user.id, friendId);
    return { message: 'Friend removed successfully' };
  }
}