import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate } from './candidate.entity';

interface UpdateCandidateData {
  name?: string;
  policy?: string;
  image?: string;
}

@Injectable()
export class CandidatesService {
  constructor(
    @InjectRepository(Candidate)
    private candidatesRepository: Repository<Candidate>,
  ) {}

  async findByElection(electionId: number) {
    return await this.candidatesRepository.find({
      where: { electionId },
      relations: ['election'],
    });
  }

  async findOne(id: number) {
    return await this.candidatesRepository.findOne({
      where: { id },
      relations: ['election'],
    });
  }

  async update(id: number, data: UpdateCandidateData) {
    const candidate = await this.candidatesRepository.findOne({
      where: { id },
    });
    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    if (data.name !== undefined) candidate.name = data.name;
    if (data.policy !== undefined) candidate.policy = data.policy;
    if (data.image !== undefined) candidate.image = data.image;

    return await this.candidatesRepository.save(candidate);
  }

  async delete(id: number) {
    const candidate = await this.candidatesRepository.findOne({
      where: { id },
    });
    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    await this.candidatesRepository.delete(id);
    return { message: 'Candidate deleted successfully' };
  }
}
