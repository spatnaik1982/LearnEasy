import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ParentService } from './parent.service';
import { UpdateParentDto } from './dto/update-parent.dto';

@Controller('parents')
@UseGuards(JwtAuthGuard)
export class ParentController {
  constructor(private parentService: ParentService) {}

  @Get(':id')
  async getProfile(@Param('id') id: string) {
    const parent = await this.parentService.getProfile(id);
    return { data: parent };
  }

  @Patch(':id')
  async updateProfile(@Param('id') id: string, @Body() dto: UpdateParentDto) {
    const parent = await this.parentService.updateProfile(id, dto);
    return { data: parent };
  }
}
