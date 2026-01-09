import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vote } from '../votes/vote.entity';
import { Candidate } from '../candidates/candidate.entity';
import { Election } from '../elections/election.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Vote)
    private votesRepository: Repository<Vote>,
    @InjectRepository(Candidate)
    private candidatesRepository: Repository<Candidate>,
    @InjectRepository(Election)
    private electionsRepository: Repository<Election>,
  ) {}

  async getElectionStats(electionId: number) {
    const election = await this.electionsRepository.findOne({
      where: { id: electionId },
      relations: ['candidates'],
    });

    if (!election) return null;

    const totalVotes = await this.votesRepository.count({ where: { electionId } });
    const voteNoCount = await this.votesRepository.count({ where: { electionId, isVoteNo: true } });

    const candidateStats = await Promise.all(
      election.candidates.map(async (candidate) => {
        const count = await this.votesRepository.count({ where: { candidateId: candidate.id } });
        return {
          id: candidate.id,
          name: candidate.name,
          votes: count,
          percentage: totalVotes > 0 ? (count / totalVotes) * 100 : 0,
        };
      }),
    );

    return {
      electionTitle: election.title,
      totalVotes,
      voteNoCount,
      candidateStats,
    };
  }
}
