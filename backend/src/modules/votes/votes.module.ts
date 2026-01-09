import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vote } from './vote.entity';
import { VotesService } from './votes.service';
import { VotesController } from './votes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Vote])],
  exports: [TypeOrmModule],
  providers: [VotesService],
  controllers: [VotesController],
})
export class VotesModule {}
