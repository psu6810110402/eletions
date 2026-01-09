import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { username } });
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }

  async register(username: string, pass: string): Promise<any> {
    // Check if user exists
    const existing = await this.usersRepository.findOne({ where: { username } });
    if (existing) {
      throw new Error('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(pass, 10);
    // Determine type by pattern (e.g. if username starts with 'admin' -> staff?)
    // For now, public registration is always VOTER
    const user = this.usersRepository.create({
      username,
      password: hashedPassword,
      role: 'VOTER' as any, // Type cast or import enum
      userType: 'Student', // Default for public reg
    });
    
    await this.usersRepository.save(user);
    const { password, ...result } = user;
    return result;
  }
}
