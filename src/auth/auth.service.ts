import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto, LoginDto } from '../dto/user.dto';
import { AuthResponseDto } from '../dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<AuthResponseDto> {
    // Check if user already exists
    const existingUser = await this.usersService.findByUsernameOrEmail(createUserDto.username);
    const existingEmail = await this.usersService.findByEmail(createUserDto.email);
    
    if (existingUser) {
      throw new UnauthorizedException('Username already exists');
    }
    
    if (existingEmail) {
      throw new UnauthorizedException('Email already exists');
    }

    const user = await this.usersService.create(createUserDto);
    const payload = { sub: user.id, username: user.username, email: user.email };
    
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        rating: user.rating,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findByUsernameOrEmail(loginDto.usernameOrEmail);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.usersService.validatePassword(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last seen
    await this.usersService.updateLastSeen(user.id);

    const payload = { sub: user.id, username: user.username, email: user.email };
    
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        rating: user.rating,
      },
    };
  }
}