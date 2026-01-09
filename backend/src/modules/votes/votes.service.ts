import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vote } from './vote.entity';

@Injectable()
export class VotesService {
  constructor(
    @InjectRepository(Vote)
    private votesRepository: Repository<Vote>,
  ) {}

  async create(userId: number, electionId: number, candidateId?: number, isVoteNo: boolean = false) {
    // ค้นหาใน DB ว่าคนนี้ (userId) เคยโหวตเลือกตั้งนี้ (electionId) ไหม?
    const existingVote = await this.votesRepository.findOne({
      where: { userId, electionId },
    });
    // ถ้าเจอ (Vote ไปแล้ว) -> ดีด Error ใส่หน้าทันที "ห้ามโหวตซ้ำ!"
    if (existingVote) {
      throw new ConflictException('You have already voted in this election');
    }
    // ถ้าไม่เจอ (ยังไม่โหวต) -> ดีด Error ใส่หน้าทันที "ต้องเลือกผู้สมัครหรือโหวตไม่"
    if (!candidateId && !isVoteNo) {
      throw new BadRequestException('Must either select a candidate or Vote No');
    }
    // ถ้าไม่เจอ (ยังไม่โหวต) -> สร้าง Vote ใหม่
    const vote = this.votesRepository.create({
      userId,
      electionId,
      candidateId,
      isVoteNo,
    });
    // บันทึก Vote ใหม่
    return await this.votesRepository.save(vote);
  }

  async findByUser(userId: number) {
    return await this.votesRepository.find({
      where: { userId },
      relations: ['election', 'candidate'],
    });
  }
}
