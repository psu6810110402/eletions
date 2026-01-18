import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vote } from '../votes/vote.entity';
import { Candidate } from '../candidates/candidate.entity';
import { Election } from '../elections/election.entity';

interface CandidateStat {
  id: number;
  name: string;
  votes: number;
  percentage: number;
}

export interface ElectionStats {
  electionTitle: string;
  totalVotes: number;
  voteNoCount: number;
  candidateStats: CandidateStat[];
}

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

  async getElectionStats(electionId: number): Promise<ElectionStats | null> {
    // ดึงข้อมูล
    const election = await this.electionsRepository.findOne({
      where: { id: electionId },
      relations: ['candidates'],
    });

    if (!election) return null;
    // Total votes
    const totalVotes = await this.votesRepository.count({
      where: { electionId },
    });
    const voteNoCount = await this.votesRepository.count({
      where: { electionId, isVoteNo: true },
    });

    const candidateStats: CandidateStat[] = await Promise.all(
      election.candidates.map(async (candidate) => {
        const count = await this.votesRepository.count({
          where: { candidateId: candidate.id },
        });
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

  async exportToCSV(electionId: number): Promise<string | null> {
    const stats = await this.getElectionStats(electionId);
    if (!stats) return null;

    // Build CSV content
    const lines: string[] = [];
    lines.push('Election Results Report');
    lines.push(`Election: ${stats.electionTitle}`);
    lines.push(`Total Votes: ${stats.totalVotes}`);
    lines.push(`Vote No Count: ${stats.voteNoCount}`);
    lines.push('');
    lines.push('Candidate Name,Votes,Percentage');

    for (const candidate of stats.candidateStats) {
      lines.push(
        `${candidate.name},${candidate.votes},${candidate.percentage.toFixed(2)}%`,
      );
    }

    return lines.join('\n');
  }
}
