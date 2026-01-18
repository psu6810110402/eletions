import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { ElectionsService } from './elections.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ElectionStatus } from './election.entity';

interface CreateElectionDto {
  title: string;
  startDate?: Date;
  endDate?: Date;
  candidates: { name: string; policy?: string; image?: string }[];
}

interface UpdateElectionDto {
  title?: string;
  startDate?: Date;
  endDate?: Date;
}

interface UpdateStatusDto {
  status: ElectionStatus;
}

@Controller('elections')
@UseGuards(JwtAuthGuard)
export class ElectionsController {
  constructor(private readonly electionsService: ElectionsService) {}

  @Get()
  async findAll() {
    return this.electionsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.electionsService.findOne(+id);
  }

  @Post()
  async create(@Body() body: CreateElectionDto) {
    return this.electionsService.create(body);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateElectionDto) {
    return this.electionsService.update(+id, body);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: UpdateStatusDto) {
    return this.electionsService.updateStatus(+id, body.status);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.electionsService.delete(+id);
  }
}
