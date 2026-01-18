import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { Request } from 'express';
import { VotesService } from './votes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
    username: string;
    role: string;
  };
}

@Controller('votes')
@UseGuards(JwtAuthGuard)
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Post()
  async vote(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: { electionId: number; candidateId?: number; isVoteNo?: boolean },
  ) {
    return this.votesService.create(
      req.user.userId,
      body.electionId,
      body.candidateId,
      body.isVoteNo,
    );
  }

  @Get('my-votes')
  async getMyVotes(@Req() req: AuthenticatedRequest) {
    return this.votesService.findByUser(req.user.userId);
  }
}
