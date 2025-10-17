import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });
    return createdUser.save();
  }

  async findByUsernameOrEmail(usernameOrEmail: string): Promise<UserDocument | null> {
    return this.userModel.findOne({
      $or: [
        { username: usernameOrEmail },
        { email: usernameOrEmail }
      ]
    }).exec();
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      { ...updateUserDto, updatedAt: new Date() },
      { new: true }
    ).exec();
    
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    
    return updatedUser;
  }

  async updateLastSeen(id: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { lastSeen: new Date() }).exec();
  }

  async updateGameStats(id: string, result: 'win' | 'loss' | 'draw'): Promise<void> {
    const updateObj: any = { $inc: { gamesPlayed: 1 } };
    
    switch (result) {
      case 'win':
        updateObj.$inc.gamesWon = 1;
        break;
      case 'loss':
        updateObj.$inc.gamesLost = 1;
        break;
      case 'draw':
        updateObj.$inc.gamesDrawn = 1;
        break;
    }
    
    await this.userModel.findByIdAndUpdate(id, updateObj).exec();
  }

  async updateRating(id: string, ratingChange: number): Promise<void> {
    const user = await this.userModel.findById(id).exec();
    if (!user) return;
    
    // Calculate new rating with minimum of 0
    const newRating = Math.max(0, (user.rating || 1200) + ratingChange);
    
    await this.userModel.findByIdAndUpdate(id, { rating: newRating }).exec();
  }

  async findRandomOpponent(userId: string, ratingRange: number = 100): Promise<UserDocument | null> {
    const currentUser = await this.findById(userId);
    const userRating = currentUser.rating || 1200;
    
    // Find users within rating range (±100) who are active
    const opponents = await this.userModel.find({
      _id: { $ne: userId },
      rating: {
        $gte: userRating - ratingRange,
        $lte: userRating + ratingRange
      },
      isActive: true
    }).exec();
    
    if (opponents.length === 0) return null;
    
    // Return random opponent
    const randomIndex = Math.floor(Math.random() * opponents.length);
    return opponents[randomIndex];
  }

  async getLeaderboard(limit: number = 5): Promise<UserDocument[]> {
    return this.userModel
      .find()
      .sort({ rating: -1 })
      .limit(limit)
      .select('username rating gamesPlayed gamesWon gamesLost gamesDrawn')
      .exec();
  }

  async addFriend(userId: string, friendId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(
      userId,
      { $addToSet: { friends: friendId } }
    ).exec();
  }

  async removeFriend(userId: string, friendId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(
      userId,
      { $pull: { friends: friendId } }
    ).exec();
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}