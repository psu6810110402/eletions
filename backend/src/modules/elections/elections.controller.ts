import { Controller, Get, Post, Body, Delete, Param, UseGuards } from '@nestjs/common';
import { ElectionsService } from './elections.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

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
  async create(@Body() body: any) {
    return this.electionsService.create(body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.electionsService.delete(+id);
  }
}
