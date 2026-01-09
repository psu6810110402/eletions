import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vote } from '../votes/vote.entity';
import { Candidate } from '../candidates/candidate.entity';
import { Election } from '../elections/election.entity';
import { User } from '../users/user.entity';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Vote, Candidate, Election, User])],
  providers: [StatsService],
  controllers: [StatsController],
})
export class StatsModule {}
