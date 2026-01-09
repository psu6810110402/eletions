import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Election, ElectionStatus } from './election.entity';
import { Candidate } from '../candidates/candidate.entity';

@Injectable()
export class ElectionsService {
  constructor(
    @InjectRepository(Election)
    private electionsRepository: Repository<Election>,
    @InjectRepository(Candidate)
    private candidatesRepository: Repository<Candidate>,
  ) {}

  async create(data: { title: string; startDate?: Date; endDate?: Date; candidates: { name: string; policy?: string; image?: string }[] }) {
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

  async delete(id: number) {
    await this.electionsRepository.delete(id);
    return { message: 'Deleted' };
  }

  async findAll() {
    return await this.electionsRepository.find({
      relations: ['candidates'],
    });
  }

  async findOne(id: number) {
    return await this.electionsRepository.findOne({
      where: { id },
      relations: ['candidates'],
    });
  }
}
