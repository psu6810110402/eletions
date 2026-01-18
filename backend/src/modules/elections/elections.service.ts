import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Election, ElectionStatus } from './election.entity';
import { Candidate } from '../candidates/candidate.entity';
import { User } from '../users/user.entity';

interface CreateElectionData {
  title: string;
  startDate?: Date;
  endDate?: Date;
  candidates: { name: string; policy?: string; image?: string }[];
}

interface UpdateElectionData {
  title?: string;
  startDate?: Date;
  endDate?: Date;
}

@Injectable()
export class ElectionsService {
  constructor(
    @InjectRepository(Election)
    private electionsRepository: Repository<Election>,
    @InjectRepository(Candidate)
    private candidatesRepository: Repository<Candidate>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(data: CreateElectionData) {
    const election = this.electionsRepository.create({
      title: data.title,
      startDate: data.startDate,
      endDate: data.endDate,
      status: ElectionStatus.ONGOING,
    });
    const savedElection = await this.electionsRepository.save(election);

    if (data.candidates?.length > 0) {
      const candidates = data.candidates.map((c) =>
        this.candidatesRepository.create({ ...c, election: savedElection }),
      );
      await this.candidatesRepository.save(candidates);
    }
    return this.findOne(savedElection.id);
  }

  async update(id: number, data: UpdateElectionData) {
    const election = await this.electionsRepository.findOne({ where: { id } });
    if (!election) {
      throw new NotFoundException('Election not found');
    }

    if (data.title !== undefined) election.title = data.title;
    if (data.startDate !== undefined) election.startDate = data.startDate;
    if (data.endDate !== undefined) election.endDate = data.endDate;

    await this.electionsRepository.save(election);
    return this.findOne(id);
  }

  async updateStatus(id: number, status: ElectionStatus) {
    const election = await this.electionsRepository.findOne({ where: { id } });
    if (!election) {
      throw new NotFoundException('Election not found');
    }

    election.status = status;
    await this.electionsRepository.save(election);
    return this.findOne(id);
  }

  async delete(id: number) {
    await this.electionsRepository.delete(id);
    return { message: 'Deleted' };
  }

  async findAll() {
    return await this.electionsRepository.find({
      relations: ['candidates', 'eligibleVoters'],
    });
  }

  async findOne(id: number) {
    return await this.electionsRepository.findOne({
      where: { id },
      relations: ['candidates', 'eligibleVoters'],
    });
  }

  // Eligible Voters Management
  async getEligibleVoters(electionId: number) {
    const election = await this.electionsRepository.findOne({
      where: { id: electionId },
      relations: ['eligibleVoters'],
    });
    if (!election) {
      throw new NotFoundException('Election not found');
    }
    return election.eligibleVoters;
  }

  async addEligibleVoter(electionId: number, userId: number) {
    const election = await this.electionsRepository.findOne({
      where: { id: electionId },
      relations: ['eligibleVoters'],
    });
    if (!election) {
      throw new NotFoundException('Election not found');
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const alreadyEligible = election.eligibleVoters.some(
      (v) => v.id === userId,
    );
    if (!alreadyEligible) {
      election.eligibleVoters.push(user);
      await this.electionsRepository.save(election);
    }

    return { message: 'User added to eligible voters' };
  }

  async removeEligibleVoter(electionId: number, userId: number) {
    const election = await this.electionsRepository.findOne({
      where: { id: electionId },
      relations: ['eligibleVoters'],
    });
    if (!election) {
      throw new NotFoundException('Election not found');
    }

    election.eligibleVoters = election.eligibleVoters.filter(
      (v) => v.id !== userId,
    );
    await this.electionsRepository.save(election);

    return { message: 'User removed from eligible voters' };
  }

  async isUserEligible(electionId: number, userId: number): Promise<boolean> {
    const election = await this.electionsRepository.findOne({
      where: { id: electionId },
      relations: ['eligibleVoters'],
    });
    if (!election) return false;

    // If no eligible voters set, everyone can vote
    if (election.eligibleVoters.length === 0) return true;

    return election.eligibleVoters.some((v) => v.id === userId);
  }
}
