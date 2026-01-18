import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

export interface UserProfile {
  id: number;
  username: string;
  role: string;
  userType: string | null;
}

interface UpdateProfileData {
  userType?: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findById(id: number): Promise<UserProfile | null> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      userType: user.userType,
    };
  }

  async updateProfile(
    id: number,
    data: UpdateProfileData,
  ): Promise<UserProfile> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (data.userType !== undefined) {
      user.userType = data.userType;
    }

    await this.usersRepository.save(user);

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      userType: user.userType,
    };
  }
}
