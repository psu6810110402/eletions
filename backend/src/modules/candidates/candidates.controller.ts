import {
  Controller,
  Get,
  Param,
  Patch,
  Delete,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface UpdateCandidateDto {
  name?: string;
  policy?: string;
  image?: string;
}

@Controller('candidates')
@UseGuards(JwtAuthGuard)
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Get('election/:electionId')
  async findByElection(@Param('electionId') electionId: string) {
    return this.candidatesService.findByElection(+electionId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.candidatesService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateCandidateDto) {
    return this.candidatesService.update(+id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.candidatesService.delete(+id);
  }
}
