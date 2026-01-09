import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Election } from './election.entity';
import { Candidate } from '../candidates/candidate.entity';
import { ElectionsService } from './elections.service';
import { ElectionsController } from './elections.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Election, Candidate])],
  exports: [TypeOrmModule],
  providers: [ElectionsService],
  controllers: [ElectionsController],
})
export class ElectionsModule {}
