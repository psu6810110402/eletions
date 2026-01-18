import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Election } from './election.entity';
import { Candidate } from '../candidates/candidate.entity';
import { User } from '../users/user.entity';
import { ElectionsService } from './elections.service';
import { ElectionsController } from './elections.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Election, Candidate, User])],
  exports: [TypeOrmModule, ElectionsService],
  providers: [ElectionsService],
  controllers: [ElectionsController],
})
export class ElectionsModule {}
