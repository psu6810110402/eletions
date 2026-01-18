import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import {
  AuthService,
  LoginResponse,
  ValidatedUser,
  ChangePasswordResult,
} from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

interface LoginDto {
  username: string;
  password: string;
}

interface RegisterDto {
  username: string;
  password: string;
}

interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
    username: string;
    role: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginDto): Promise<LoginResponse> {
    const user = await this.authService.validateUser(
      body.username,
      body.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() body: RegisterDto): Promise<ValidatedUser> {
    if (!body.username || !body.password) {
      throw new UnauthorizedException('Username and password are required');
    }
    return this.authService.register(body.username, body.password);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Req() req: AuthenticatedRequest,
    @Body() body: ChangePasswordDto,
  ): Promise<ChangePasswordResult> {
    return this.authService.changePassword(
      req.user.userId,
      body.oldPassword,
      body.newPassword,
    );
  }
}
