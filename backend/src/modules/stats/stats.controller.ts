import {
  Controller,
  Get,
  Param,
  UseGuards,
  Res,
  NotFoundException,
} from '@nestjs/common';
import type { Response } from 'express';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { UserRole } from '../users/user.entity';

@Controller('stats')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get(':electionId')
  async getStats(@Param('electionId') electionId: string) {
    return this.statsService.getElectionStats(+electionId);
  }

  @Get(':electionId/export')
  @Roles(UserRole.ADMIN)
  async exportCSV(
    @Param('electionId') electionId: string,
    @Res() res: Response,
  ) {
    const csv = await this.statsService.exportToCSV(+electionId);
    if (!csv) {
      throw new NotFoundException('Election not found');
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=election-${electionId}-results.csv`,
    );
    res.send(csv);
  }
}
