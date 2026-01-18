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
import { RolesGuard, Roles } from '../auth/roles.guard';
import { UserRole } from '../users/user.entity';
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

interface AddEligibleVoterDto {
  userId: number;
}

@Controller('elections')
@UseGuards(JwtAuthGuard, RolesGuard)
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
  @Roles(UserRole.ADMIN)
  async create(@Body() body: CreateElectionDto) {
    return this.electionsService.create(body);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() body: UpdateElectionDto) {
    return this.electionsService.update(+id, body);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  async updateStatus(@Param('id') id: string, @Body() body: UpdateStatusDto) {
    return this.electionsService.updateStatus(+id, body.status);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async delete(@Param('id') id: string) {
    return this.electionsService.delete(+id);
  }

  // Eligible Voters Endpoints
  @Get(':id/eligible-voters')
  @Roles(UserRole.ADMIN)
  async getEligibleVoters(@Param('id') id: string) {
    return this.electionsService.getEligibleVoters(+id);
  }

  @Post(':id/eligible-voters')
  @Roles(UserRole.ADMIN)
  async addEligibleVoter(
    @Param('id') id: string,
    @Body() body: AddEligibleVoterDto,
  ) {
    return this.electionsService.addEligibleVoter(+id, body.userId);
  }

  @Delete(':id/eligible-voters/:userId')
  @Roles(UserRole.ADMIN)
  async removeEligibleVoter(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return this.electionsService.removeEligibleVoter(+id, +userId);
  }
}
