import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { MastersService } from '../services/masters.service';

@ApiTags('Masters')
@Controller('masters')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MastersController {
  constructor(private readonly mastersService: MastersService) {}

  @Get()
  @ApiOperation({ summary: 'Get scan-related master data' })
  @ApiResponse({ status: 200, description: 'Master data returned' })
  async getMasters() {
    return this.mastersService.getScanMasters();
  }

  @Get('scan')
  @ApiOperation({ summary: 'Get scan screen master data' })
  @ApiResponse({ status: 200, description: 'Scan masters returned' })
  async getScanMasters() {
    return this.mastersService.getScanMasters();
  }
}
