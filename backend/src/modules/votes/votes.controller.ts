import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { VotesService } from './votes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('votes')
@UseGuards(JwtAuthGuard)
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Post()
  async vote(@Req() req: any, @Body() body: { electionId: number; candidateId?: number; isVoteNo?: boolean }) {
    return this.votesService.create(
      req.user.userId,
      body.electionId,
      body.candidateId,
      body.isVoteNo,
    );
  }

  @Get('my-votes')
  async getMyVotes(@Req() req: any) {
    return this.votesService.findByUser(req.user.userId);
  }
}
